/**
 * The surname a card names an EMR with. The current-EMR list carries full names
 * ("Jax Ryder"), while a student profile and a discharge letter address the
 * member by surname ("EMR Ryder", "Dear Mr. Ryder") - so both derive it here
 * rather than each keeping a copy of the rule.
 */
export function emrSurname(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : name.trim();
}
