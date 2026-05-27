export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a26] border border-[#2a2a3e] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#8888aa] opacity-50" />
      </div>
      <h3 className="text-lg font-display font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-[#8888aa] mb-6 max-w-xs">{description}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  )
}
