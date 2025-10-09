

export const Divider = ({
  size = 2,
  offset = 12,
}: {
  size?: string | number,
  offset?: string | number,
}) => {
  return (
    <hr 
      className="border border-[var(--primary-color)]" 
      style={{ 
        borderWidth: `${size}px`,
        marginTop: `${offset}px`,
        marginBottom: `${offset}px`,
      }} 
    />
  )
}
