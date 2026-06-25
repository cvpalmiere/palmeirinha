import * as LucideIcons from 'lucide-react';

export default function Icon({ name, size = 20, color = 'currentColor', className = '', ...props }) {
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} className={className} {...props} />;
}