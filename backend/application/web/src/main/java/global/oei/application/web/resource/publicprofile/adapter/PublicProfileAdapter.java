package global.oei.application.web.resource.publicprofile.adapter;

import java.util.List;

import global.oei.domain.shared.publicprofile.DigitalBusinessCard;
import global.oei.domain.shared.publicprofile.PublicProfile;

public interface PublicProfileAdapter {

    PublicProfile getMySettings();

    PublicProfile publish(String publicSlug, List<String> visibleFields, String seoDescription);

    DigitalBusinessCard generateDigitalCard();
}
