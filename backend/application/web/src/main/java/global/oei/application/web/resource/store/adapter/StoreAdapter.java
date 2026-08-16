package global.oei.application.web.resource.store.adapter;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.NewOrderLine;
import global.oei.domain.shared.store.Order;

/**
 * Web-facing adapter over the store use cases, scoped to the currently authenticated member
 * (mirrors {@code MembershipFeeAdapter}).
 */
public interface StoreAdapter {

    Optional<BusinessCardPreview> generateBusinessCardPreview(BusinessCardCustomization customization);

    Order createMyOrder(List<NewOrderLine> lines);

    List<Order> listMyOrders();

    Optional<Order> getMyOrder(String orderId);

    Optional<Order> payMyOrder(String orderId, PaymentMethod paymentMethod, String paymentToken);
}
