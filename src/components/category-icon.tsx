import {
  Battery,
  Camera,
  Drone,
  Headphones,
  Keyboard,
  Monitor,
  Mouse,
  Watch,
  type LucideIcon,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  headphones: Headphones,
  keyboard: Keyboard,
  mouse: Mouse,
  monitor: Monitor,
  watch: Watch,
  drone: Drone,
  camera: Camera,
  battery: Battery,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = registry[name] ?? Battery;
  return <Icon className={className} aria-hidden="true" />;
}
