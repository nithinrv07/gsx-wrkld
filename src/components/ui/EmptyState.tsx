import React, { isValidElement, ElementType } from 'react';
import { FolderSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ElementType | React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconProp,
  title,
  description,
  action,
  secondaryAction,
  bordered = true,
  className = '',
}) => {
  const renderIcon = () => {
    if (!IconProp) {
      return <FolderSearch className="w-8 h-8 text-[#5851d8]" />;
    }
    if (isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as ElementType;
    return <IconComponent className="w-8 h-8 text-[#5851d8]" />;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-white ${
        bordered ? 'border-2 border-dashed border-slate-200/90' : ''
      } ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 flex items-center justify-center mb-4 shadow-xs">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
