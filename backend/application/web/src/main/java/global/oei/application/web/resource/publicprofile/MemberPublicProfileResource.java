package global.oei.application.web.resource.publicprofile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberPublicProfileApi;
import global.oei.application.web.model.DigitalBusinessCardDTO;
import global.oei.application.web.model.PublicProfileDTO;
import global.oei.application.web.model.PublicProfilePublicationDTO;
import global.oei.application.web.resource.publicprofile.adapter.PublicProfileAdapter;
import global.oei.application.web.resource.publicprofile.mapper.PublicProfileDtoMapper;

/**
 * Implements every operation of {@link MemberPublicProfileApi}. Digital cards generated here
 * are mocked (see {@code GenerateDigitalBusinessCardService}'s Javadoc): no real QR renderer or
 * vCard file generator.
 */
@RestController
@RequiredArgsConstructor
public class MemberPublicProfileResource implements MemberPublicProfileApi {

    private final PublicProfileAdapter publicProfileAdapter;

    @Override
    public ResponseEntity<PublicProfileDTO> getMyPublicProfileSettings() {
        return ResponseEntity.ok(PublicProfileDtoMapper.toDto(publicProfileAdapter.getMySettings()));
    }

    @Override
    public ResponseEntity<PublicProfileDTO> publishPublicProfile(final PublicProfilePublicationDTO request) {
        final var published = publicProfileAdapter.publish(request.getPublicSlug(), request.getVisibleFields(), request.getSeoDescription());
        return ResponseEntity.ok(PublicProfileDtoMapper.toDto(published));
    }

    @Override
    public ResponseEntity<DigitalBusinessCardDTO> generateDigitalCard() {
        return ResponseEntity.ok(PublicProfileDtoMapper.toDto(publicProfileAdapter.generateDigitalCard()));
    }
}
