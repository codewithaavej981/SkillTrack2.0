const Skill = require('../models/Skill');
const Goal = require('../models/Goal');
const LearningResource = require('../models/LearningResource');

// GET /api/reports
exports.getReportData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'overall', startDate, endDate } = req.query;

    // Validate type parameter
    const validTypes = ['overall', 'skills', 'goals', 'learning'];
    const reportType = validTypes.includes(type) ? type : 'overall';

    // Validate and build date filter
    const dateQuery = {};
    if (startDate) {
      const parsedStart = new Date(startDate);
      if (isNaN(parsedStart.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format. Use a valid date string (e.g., YYYY-MM-DD).',
        });
      }
      dateQuery.$gte = parsedStart;
    }

    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (isNaN(parsedEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate format. Use a valid date string (e.g., YYYY-MM-DD).',
        });
      }
      parsedEnd.setHours(23, 59, 59, 999);
      dateQuery.$lte = parsedEnd;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'startDate cannot be after endDate.',
      });
    }

    // Build user-scoped queries
    const baseFilter = { user: userId };
    if (Object.keys(dateQuery).length > 0) {
      baseFilter.createdAt = dateQuery;
    }

    // Fetch user-owned collections in parallel
    const [skills, goals, resources] = await Promise.all([
      Skill.find(baseFilter).sort({ progress: -1, name: 1 }),
      Goal.find(baseFilter).sort({ deadline: 1, createdAt: -1 }),
      LearningResource.find(baseFilter).sort({ updatedAt: -1 }),
    ]);

    const now = new Date();

    // 1. Skill metrics
    const totalSkills = skills.length;
    const avgSkillProgress = totalSkills > 0
      ? Math.round(skills.reduce((sum, s) => sum + (s.progress || 0), 0) / totalSkills)
      : 0;
    const strengths = skills.filter((s) => (s.progress || 0) >= 75);
    const needsImprovement = skills.filter((s) => (s.progress || 0) < 50);

    const skillsByLevel = skills.reduce((acc, s) => {
      const lvl = s.level || 'Beginner';
      acc[lvl] = (acc[lvl] || 0) + 1;
      return acc;
    }, {});

    const skillsByCategory = skills.reduce((acc, s) => {
      const cat = s.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // 2. Goal metrics
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => Boolean(g.completed) || g.progress === 100);
    const inProgressGoals = goals.filter((g) => !g.completed && (g.progress || 0) > 0 && g.progress < 100);
    const notStartedGoals = goals.filter((g) => !g.completed && (g.progress || 0) === 0);
    const goalCompletionRate = totalGoals > 0
      ? Math.round((completedGoals.length / totalGoals) * 100)
      : 0;
    const avgGoalProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals)
      : 0;
    const overdueGoals = goals.filter((g) => !g.completed && g.deadline && new Date(g.deadline) < now);
    const upcomingGoals = goals.filter((g) => !g.completed && g.deadline && new Date(g.deadline) >= now);

    // 3. Learning resource metrics
    const totalResources = resources.length;
    const completedResources = resources.filter((r) => Boolean(r.completed) || (r.progress || 0) >= 100);
    const inProgressResources = resources.filter((r) => !r.completed && (r.progress || 0) > 0 && r.progress < 100);
    const notStartedResources = resources.filter((r) => !r.completed && (r.progress || 0) === 0);
    const avgLearningProgress = totalResources > 0
      ? Math.round(resources.reduce((sum, r) => sum + (r.progress || 0), 0) / totalResources)
      : 0;
    const learningCompletionRate = totalResources > 0
      ? Math.round((completedResources.length / totalResources) * 100)
      : 0;

    const resourcesByCategory = resources.reduce((acc, r) => {
      const cat = r.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // 4. Overall score: weighted composite progress (skills 40%, goals 35%, learning 25%)
    let activeComponents = 0;
    let compositeSum = 0;
    if (totalSkills > 0) {
      compositeSum += avgSkillProgress * 0.4;
      activeComponents += 0.4;
    }
    if (totalGoals > 0) {
      compositeSum += goalCompletionRate * 0.35;
      activeComponents += 0.35;
    }
    if (totalResources > 0) {
      compositeSum += avgLearningProgress * 0.25;
      activeComponents += 0.25;
    }
    const overallProgress = activeComponents > 0
      ? Math.round(compositeSum / activeComponents)
      : 0;

    // Reporting period metadata
    let periodLabel = 'All Time';
    if (startDate && endDate) {
      periodLabel = `${startDate} to ${endDate}`;
    } else if (startDate) {
      periodLabel = `Since ${startDate}`;
    } else if (endDate) {
      periodLabel = `Up to ${endDate}`;
    }

    res.json({
      success: true,
      data: {
        reportType,
        user: {
          name: req.user.name || 'Member',
          email: req.user.email || '',
          role: req.user.role || 'SkillTracker Member',
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
          label: periodLabel,
        },
        generatedAt: now.toISOString(),
        summary: {
          overallProgress,
          totalSkills,
          avgSkillProgress,
          totalGoals,
          completedGoals: completedGoals.length,
          inProgressGoals: inProgressGoals.length,
          goalCompletionRate,
          avgGoalProgress,
          totalResources,
          completedResources: completedResources.length,
          inProgressResources: inProgressResources.length,
          learningCompletionRate,
          avgLearningProgress,
        },
        skills: {
          total: totalSkills,
          avgProgress: avgSkillProgress,
          strengthsCount: strengths.length,
          needsImprovementCount: needsImprovement.length,
          byLevel: skillsByLevel,
          byCategory: skillsByCategory,
          strengths: strengths.map((s) => ({
            id: s._id,
            name: s.name,
            category: s.category,
            level: s.level,
            progress: s.progress || 0,
          })),
          needsImprovement: needsImprovement.map((s) => ({
            id: s._id,
            name: s.name,
            category: s.category,
            level: s.level,
            progress: s.progress || 0,
          })),
          items: skills.map((s) => ({
            id: s._id,
            name: s.name,
            category: s.category,
            level: s.level,
            progress: s.progress || 0,
            targetDate: s.targetDate || null,
            description: s.description || '',
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          })),
        },
        goals: {
          total: totalGoals,
          completed: completedGoals.length,
          inProgress: inProgressGoals.length,
          notStarted: notStartedGoals.length,
          completionRate: goalCompletionRate,
          avgProgress: avgGoalProgress,
          overdueCount: overdueGoals.length,
          upcomingCount: upcomingGoals.length,
          items: goals.map((g) => ({
            id: g._id,
            title: g.title,
            description: g.description || '',
            category: g.category || 'General',
            progress: g.progress || 0,
            completed: Boolean(g.completed),
            deadline: g.deadline || null,
            isOverdue: Boolean(!g.completed && g.deadline && new Date(g.deadline) < now),
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
          })),
        },
        learning: {
          total: totalResources,
          completed: completedResources.length,
          inProgress: inProgressResources.length,
          notStarted: notStartedResources.length,
          completionRate: learningCompletionRate,
          avgProgress: avgLearningProgress,
          byCategory: resourcesByCategory,
          items: resources.map((r) => ({
            id: r._id,
            title: r.title,
            source: r.source,
            category: r.category,
            url: r.url || '',
            progress: r.progress || 0,
            completed: Boolean(r.completed || (r.progress || 0) >= 100),
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
