import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string | null;
    image?: string | null;
    fullName?: string | null;
    name?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
    email?: string | null;
  } | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const displayName = user?.name || user?.fullName || 'User';
  const displayEmail = user?.email || user?.emailAddresses?.[0]?.emailAddress || '';
  const avatarUrl = user?.image || user?.imageUrl || '';
  const fallback = displayName.slice(0, 2).toUpperCase() || 'US';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className='bg-muted text-muted-foreground rounded-lg text-xs font-medium'>
          {fallback}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-medium'>{displayName}</span>
          <span className='text-muted-foreground truncate text-xs'>{displayEmail}</span>
        </div>
      )}
    </div>
  );
}
