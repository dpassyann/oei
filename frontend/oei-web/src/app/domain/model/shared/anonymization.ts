// Shared anonymization threshold for every aggregate computed over member declarations across
// the whole site — the profile salary benchmark (`SalaryBenchmarkMockAdapter`) and the
// Professional Neural Network's salary transparency feature (`NetworkGraphPort.getSalaryInsight`)
// both gate their computed ranges behind this single constant so the two features can never
// disagree on "how anonymous is anonymous enough". A pool with fewer contributors than this
// never resolves to a computed range — only to the explicit "not enough data" value state
// (`undefined`), matching `PublicProfilePort.getBySlug`'s convention of representing "nothing to
// show yet" as a value rather than an error.
export const MIN_ANONYMIZED_SAMPLE_SIZE = 5;
