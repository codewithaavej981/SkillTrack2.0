const Skill = require('../models/Skill');
const Goal = require('../models/Goal');
const LearningResource = require('../models/LearningResource');

exports.getAnalytics = async (req, res, next) => {
  try {
    // All queries strictly scoped to authenticated user ID from authMiddleware
    const userId = req.user._id;

    const [skills, goals, resources] = await Promise.all([
      Skill.find({ user: userId }).sort({ updatedAt: -1 }),
      Goal.find({ user: userId }).sort({ updatedAt: -1 }),
      LearningResource.find({ user: userId }).sort({ updatedAt: -1 }),
    ]);

    // 1. Skill metrics
    const totalSkills = skills.length;
    const avgSkillProgress = totalSkills > 0
      ? Math.round(skills.reduce((sum, s) => sum + (s.progress || 0), 0) / totalSkills)
      : 0;

    // Skill distribution by level (e.g. Beginner, Intermediate, Advanced)
    const levelCounts = skills.reduce((acc, s) => {
      const lvl = s.level || 'Beginner';
      acc[lvl] = (acc[lvl] || 0) + 1;
      return acc;
    }, {});

    // Skill distribution by category (e.g. Development, Design, etc.)
    const categoryCounts = skills.reduce((acc, s) => {
      const cat = s.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // 2. Goal metrics & status handling
    // The Goal model only contains `completed` (Boolean, default false) and `progress` (Number, default 0).
    // Definition: Completed goals have `completed === true`. In-progress goals are all non-completed goals (`!completed`).
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => Boolean(g.completed)).length;
    const inProgressGoals = totalGoals - completedGoals;
    const goalCompletionRate = totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;
    const avgGoalProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals)
      : 0;

    // 3. Learning resource metrics
    // The LearningResource model contains `completed` (Boolean, default false) and `progress` (Number, default 0).
    // Definition: Completed resources have `completed === true` or `progress === 100`. Remaining resources are total minus completed.
    const totalResources = resources.length;
    const completedResources = resources.filter((r) => Boolean(r.completed) || r.progress === 100).length;
    const remainingResources = totalResources - completedResources;

    // 4. Five most recent activities based on record timestamps (updatedAt fallback to createdAt)
    const activities = [
      ...skills.map((s) => ({
        id: `skill-${s._id}`,
        type: 'skill',
        title: s.name,
        action: `Skill progress at ${s.progress || 0}%`,
        category: s.category || 'Skill',
        timestamp: s.updatedAt || s.createdAt,
      })),
      ...goals.map((g) => ({
        id: `goal-${g._id}`,
        type: 'goal',
        title: g.title,
        action: g.completed ? 'Goal completed' : `Goal in progress (${g.progress || 0}%)`,
        category: g.category || 'Goal',
        timestamp: g.updatedAt || g.createdAt,
      })),
      ...resources.map((r) => ({
        id: `resource-${r._id}`,
        type: 'resource',
        title: r.title,
        action: (r.completed || r.progress === 100) ? 'Resource completed' : `Learning in progress (${r.progress || 0}%)`,
        category: r.category || 'Learning',
        timestamp: r.updatedAt || r.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        skills: {
          total: totalSkills,
          avgProgress: avgSkillProgress,
          byLevel: levelCounts,
          byCategory: categoryCounts,
          items: skills,
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
          inProgress: inProgressGoals,
          completionRate: goalCompletionRate,
          avgProgress: avgGoalProgress,
          items: goals,
        },
        learning: {
          total: totalResources,
          completed: completedResources,
          remaining: remainingResources,
          inProgress: remainingResources,
          items: resources,
        },
        recentActivity: activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
