export default function Input({ value, onChange, placeholder }) {
  return (
    <div className="input-area">
      <input
        type="text"
        value={value}
        onBlur={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
