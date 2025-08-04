// Mock for lucide-react icons
import React from 'react';

const createMockIcon = (name) => {
  const MockIcon = (props) => React.createElement('div', {
    'data-testid': `${name}-icon`,
    'data-lucide': name,
    className: props.className,
    style: { 
      width: props.size || 24, 
      height: props.size || 24,
      display: 'inline-block'
    },
    ...props
  }, name);
  
  MockIcon.displayName = name;
  return MockIcon;
};

// Export all the icons used in the project
export const Play = createMockIcon('Play');
export const Pause = createMockIcon('Pause');
export const RotateCcw = createMockIcon('RotateCcw');
export const Settings = createMockIcon('Settings');
export const CheckSquare = createMockIcon('CheckSquare');
export const Square = createMockIcon('Square');
export const Edit3 = createMockIcon('Edit3');
export const Trash2 = createMockIcon('Trash2');
export const Plus = createMockIcon('Plus');
export const Minus = createMockIcon('Minus');
export const Check = createMockIcon('Check');
export const Send = createMockIcon('Send');
export const X = createMockIcon('X');
export const AlertCircle = createMockIcon('AlertCircle');
export const Flag = createMockIcon('Flag');
export const Circle = createMockIcon('Circle');
export const Clock = createMockIcon('Clock');
export const Target = createMockIcon('Target');
export const CheckCircle = createMockIcon('CheckCircle');
export const Calendar = createMockIcon('Calendar');
export const BarChart3 = createMockIcon('BarChart3');
export const Timer = createMockIcon('Timer');
export const ListTodo = createMockIcon('ListTodo');
export const ArrowDownUp = createMockIcon('ArrowDownUp');
export const Inbox = createMockIcon('Inbox');
export const ListFilter = createMockIcon('ListFilter');
export const TrendingUp = createMockIcon('TrendingUp');

// Default export
const LucideReactMocks = {
  Play,
  Pause,
  RotateCcw,
  Settings,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Check,
  Send,
  X,
  AlertCircle,
  Flag,
  Circle,
  Clock,
  Target,
  CheckCircle,
  Calendar,
  BarChart3,
  Timer,
  ListTodo,
  ArrowDownUp,
  Inbox,
  ListFilter,
  TrendingUp,
};

export default LucideReactMocks;
