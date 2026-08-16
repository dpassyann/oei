package global.oei.domain.shared.store;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link Order} persistence.
 */
public interface OrderPort {

    Order save(Order order);

    Optional<Order> findById(String id);

    List<Order> findByMemberId(MemberId memberId);

    List<Order> findAll(OrderStatus status);
}
