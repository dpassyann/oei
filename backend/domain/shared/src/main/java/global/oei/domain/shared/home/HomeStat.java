package global.oei.domain.shared.home;

import java.util.Objects;

/**
 * A single figure displayed on the public home page (e.g. "members", "certifications
 * delivered"). Per this bootstrap iteration's product decision, every value stays at
 * {@code 0} until real membership/activity data exists to compute it — see {@link HomeStatPort}.
 */
public record HomeStat(String lang, String label, long value) {

    public HomeStat {
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(label, "label must not be null");
    }
}
