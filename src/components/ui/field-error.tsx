/**
 * The line under a field that says why the value was refused.
 *
 * Every form uses the same one so a validation message looks the same wherever
 * it is shown, and it is announced rather than only coloured.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}
