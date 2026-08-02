import NotificationCard from '../components/NotificationCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function NotificationPage({
  notifications = [],
  isLoading = false,
  onDelete,
  onMarkAsRead,
  onNotificationClick,
}) {
  const accountBills = notifications.filter(item => item.category === 'bill');
  const adminAnnouncements = notifications.filter(item => item.category === 'announcement');

  return (
    <div data-testid="notification-hub-page" className="h-full overflow-y-auto p-4 sm:p-5">
      <h3 className="text-xl font-extrabold tracking-[-0.03em] text-navy-900">Updates for you</h3>
      <p className="mt-1 text-sm text-slate-500">Bills and community notices in one place.</p>
      
      {isLoading ? (
        <LoadingSkeleton
          className="mt-5"
          count={4}
          label="Loading notifications"
          variant="notifications"
        />
      ) : (
      <div className="mt-5 grid grid-cols-1 gap-5">
        <section data-testid="section-bills">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-water-600">Account bills</h4>
          {accountBills.length === 0 ? (
            <p data-testid="empty-bills" className="mt-3 text-sm text-slate-500">No billing notifications.</p>
          ) : (
            accountBills.map(bill => (
              <NotificationCard 
                key={bill.id} 
                item={bill} 
                onDelete={onDelete}
                onMarkAsRead={onMarkAsRead} 
                onNotificationClick={onNotificationClick}
              />
            ))
          )}
        </section>

        <section data-testid="section-announcements">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Community announcements</h4>
          {adminAnnouncements.length === 0 ? (
            <p data-testid="empty-announcements" className="mt-3 text-sm text-slate-500">No administrative announcements.</p>
          ) : (
            adminAnnouncements.map(announcement => (
              <NotificationCard 
                key={announcement.id} 
                item={announcement} 
                onDelete={onDelete}
                onMarkAsRead={onMarkAsRead} 
                onNotificationClick={onNotificationClick}
              />
            ))
          )}
        </section>
      </div>
      )}
    </div>
  );
}
