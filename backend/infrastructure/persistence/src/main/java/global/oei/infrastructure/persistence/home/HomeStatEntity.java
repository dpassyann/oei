package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "home_stat")
public class HomeStatEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "lang", nullable = false, length = 10)
    private String lang;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "value", nullable = false)
    private long value;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
