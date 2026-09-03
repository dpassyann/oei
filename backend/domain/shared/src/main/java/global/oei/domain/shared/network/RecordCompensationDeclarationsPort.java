package global.oei.domain.shared.network;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port: keep one member's {@code compensation_declaration} rows in sync with the
 * gross-annual-salary fields currently carried by their {@code Experience} entries.
 *
 * <p>Deliberately a full replace, not per-row CRUD — mirrors {@code ProfileLookupPort#save}'s
 * "wholesale replace" philosophy (ADR 0002): every time a member's profile is saved, this port
 * is called with the complete, freshly-derived set of declarations for that member, and the
 * adapter is responsible for reconciling that against whatever was previously stored for the
 * same {@link MemberId} — inserting/updating/removing rows as needed so the stored set exactly
 * matches {@code declarations}. Only ever touches rows for the given member; never affects other
 * members' declarations (including demo-seeded ones).</p>
 */
public interface RecordCompensationDeclarationsPort {

    void replace(MemberId memberId, List<CompensationDeclarationCandidate> declarations);
}
