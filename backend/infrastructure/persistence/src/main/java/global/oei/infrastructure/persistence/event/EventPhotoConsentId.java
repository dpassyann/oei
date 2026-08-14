package global.oei.infrastructure.persistence.event;

import java.io.Serializable;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EventPhotoConsentId implements Serializable {

    private UUID eventId;
    private UUID memberId;
}
