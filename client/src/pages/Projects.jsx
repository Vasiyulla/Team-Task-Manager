import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import { Plus, FolderPlus } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { data: projects, loading, refetch } = useFetch('/projects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = (newProject) => {
    refetch(); // Refresh the project list
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and collaborate on your projects
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={20} />
              New Project
            </Button>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader count={6} type="card" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="p-6 h-full hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold truncate">{project.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>

                  {/* Members */}
                  {project.members && project.members.length > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                      {project.members.slice(0, 3).map(member => (
                        <Avatar
                          key={member.id}
                          name={member.name}
                          size="sm"
                          title={member.name}
                        />
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{project.taskCount} tasks</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {project.progress}% done
                      </p>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FolderPlus size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">No projects yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {user?.role === 'admin'
                ? 'Create your first project to get started'
                : 'You have no projects yet. Ask an admin to invite you to a project.'}
            </p>
            {user?.role === 'admin' && (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Create Project
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </MainLayout>
  );
};

export default Projects;
