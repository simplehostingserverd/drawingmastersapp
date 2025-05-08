'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated Button
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  // Base styles
  let baseStyles = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <motion.button
      className={combinedClassName}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated Panel
interface AnimatedPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  children,
  isOpen,
  onClose,
  direction = 'right',
  className = '',
}) => {
  // Animation variants based on direction
  const variants = {
    left: {
      open: { x: 0, opacity: 1 },
      closed: { x: '-100%', opacity: 0 },
    },
    right: {
      open: { x: 0, opacity: 1 },
      closed: { x: '100%', opacity: 0 },
    },
    top: {
      open: { y: 0, opacity: 1 },
      closed: { y: '-100%', opacity: 0 },
    },
    bottom: {
      open: { y: 0, opacity: 1 },
      closed: { y: '100%', opacity: 0 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className={`fixed bg-white shadow-xl z-50 ${className}`}
            style={{
              [direction === 'left' || direction === 'right' ? 'top' : 'left']: 0,
              [direction]: 0,
              bottom: direction === 'top' ? 'auto' : 0,
              right: direction === 'left' ? 'auto' : 0,
            }}
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants[direction]}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Animated Card
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Animated List Item
interface AnimatedListItemProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
    >
      {children}
    </motion.li>
  );
};

// Animated List
interface AnimatedListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.1,
  className = '',
}) => {
  // Apply staggered delays to children
  const childrenWithStagger = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        delay: index * staggerDelay,
      });
    }
    return child;
  });

  return (
    <motion.ul
      className={className}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {childrenWithStagger}
    </motion.ul>
  );
};

// Animated Modal
interface AnimatedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  isOpen,
  onClose,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 ${className}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Animated Icon
interface AnimatedIconProps {
  children: React.ReactNode;
  animate?: boolean;
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  animate = true,
  className = '',
}) => {
  return (
    <motion.div
      className={className}
      whileHover={animate ? { rotate: 15, scale: 1.2 } : {}}
      whileTap={animate ? { scale: 0.9 } : {}}
    >
      {children}
    </motion.div>
  );
};

// Animated Tooltip
interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Position styles
  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  };
  
  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded ${positionStyles[position]} ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};