package global.oei.domain.shared.member;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link Member}.
 */
public interface MemberPort {

    Member save(Member member);

    Optional<Member> findById(MemberId id);

    Optional<Member> findByPublicSlug(String publicSlug);

    List<Member> findAll();
}
