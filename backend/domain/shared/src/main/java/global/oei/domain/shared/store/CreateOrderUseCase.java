package global.oei.domain.shared.store;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Creates a new {@link Order} at {@link OrderStatus#PENDING_PAYMENT}. The total amount is
 * always computed server-side from the current active catalog prices — the client only
 * declares which products/quantities/customizations it wants.
 */
public interface CreateOrderUseCase {

    Order execute(MemberId memberId, List<NewOrderLine> lines);
}
