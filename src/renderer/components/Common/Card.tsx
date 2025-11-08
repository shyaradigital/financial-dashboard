import React from 'react';
import classNames from 'classnames';
import './Card.css';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={classNames('custom-card', className)}>
      {(title || actions) && (
        <div className="custom-card-header">
          {title && <h3 className="custom-card-title">{title}</h3>}
          {actions && <div className="custom-card-actions">{actions}</div>}
        </div>
      )}
      <div className="custom-card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;


