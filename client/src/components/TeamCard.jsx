import React from 'react';

const TeamCard = ({ team, onSelect, isSelected }) => {
  const memberCount = team.members?.length || 0;
  const tasks = team.tasks || [];
  const taskCount = tasks.length;
  
  const stats = {
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-md ring-1 ring-purple-500/20'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-3xl shadow-sm">
            {team.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{team.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              by <span className="font-medium text-gray-700 dark:text-gray-300">{team.owner?.name || 'Unknown'}</span>
            </p>
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: team.color }}
          title={team.color}
        />
      </div>

      {team.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 italic opacity-80">
          {team.description}
        </p>
      )}

      {/* Task Status Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-end text-xs mb-1">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Team Progress</span>
          <span className="text-gray-500">{taskCount} Total Tasks</span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div 
            className="bg-green-500 h-full transition-all duration-500" 
            style={{ width: `${taskCount ? (stats.done / taskCount) * 100 : 0}%` }}
            title={`Done: ${stats.done}`}
          />
          <div 
            className="bg-blue-500 h-full transition-all duration-500" 
            style={{ width: `${taskCount ? (stats.inProgress / taskCount) * 100 : 0}%` }}
            title={`In Progress: ${stats.inProgress}`}
          />
          <div 
            className="bg-red-500 h-full transition-all duration-500" 
            style={{ width: `${taskCount ? (stats.overdue / taskCount) * 100 : 0}%` }}
            title={`Overdue: ${stats.overdue}`}
          />
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-y-2 pt-1">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Done: <b>{stats.done}</b></span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Progress: <b>{stats.inProgress}</b></span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Overdue: <b>{stats.overdue}</b></span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Members: <b>{memberCount}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
