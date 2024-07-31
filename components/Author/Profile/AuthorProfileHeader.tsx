import AuthorHeaderKeyStats from "~/components/Author/Profile/AuthorHeaderKeyStats";
import AuthorInstitutions from "~/components/Author/Profile/AuthorInstitutions";
import AuthorHeaderAchievements from "~/components/Author/Profile/AuthorHeaderAchievements";
import AuthorHeaderExpertise from "~/components/Author/Profile/AuthorHeaderExpertise";
import AuthorSocialMediaIcons from "~/components/Author/Profile/AuthorSocialMediaIcons";
import Avatar from "@mui/material/Avatar";
import { isEmpty } from "~/config/utils/nullchecks";
import { css, StyleSheet } from "aphrodite";
import { FullAuthorProfile, parseFullAuthorProfile } from "../lib/types";
import Pill from "~/components/shared/Pill";
import colors from "~/config/themes/colors";
import { Tooltip } from "@mui/material";
import PendingBadge from "~/components/shared/PendingBadge";
import { authorProfileContext } from "../lib/AuthorProfileContext";
import WelcomeToProfileBanner from "./WelcomeToProfileBanner";
import UserInfoModal from "~/components/Modals/UserInfoModal";
import { useDispatch } from "react-redux";
import { ModalActions } from "~/redux/modals";
import { useEffect, useState } from "react";
import { AuthorActions } from "~/redux/author";
import { fetchAuthorProfile } from "../lib/api";
import useCacheControl from "~/config/hooks/useCacheControl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faBuildingColumns, faEdit, faUserXmark } from "@fortawesome/pro-solid-svg-icons";
import { truncateText } from "~/config/utils/string";
import useCurrentUser from "~/config/hooks/useCurrentUser";
import GenericMenu, { MenuOption } from "~/components/shared/GenericMenu";
import IconButton from "~/components/Icons/IconButton";
import {
  faEllipsis,
} from "@fortawesome/pro-regular-svg-icons";
import VerifiedBadge from "~/components/Verification/VerifiedBadge";

const AuthorProfileHeader = () => {
  const dispatch = useDispatch();
  const { fullAuthorProfile: profile, setFullAuthorProfile } =
    authorProfileContext();

  const { revalidateAuthorProfile } = useCacheControl();
  const currentUser = useCurrentUser();

  const authorMenuOptions: MenuOption[] = [
    {
      label: "Edit profile",
      icon: <FontAwesomeIcon icon={faEdit} />,
      value: "edit",
      onClick: () => {
        dispatch(ModalActions.openUserInfoModal(true))
      },
    },
    ...(currentUser?.moderator ? [{
      label: "Ban user",
      icon: <FontAwesomeIcon icon={faUserXmark} />,
      value: "ban",
      onClick: () => {
        alert('TBD')
      },
    }] : []),
  ];

  const getExpertiseTooltipContent = () => {
    return (
      <div className={css(styles.expertiseContent)}>
        <div className={css(styles.expertiseContentBody)}>
          The expertise shown below is only an estimate because the author has
          not yet verified the publications in their profile.
        </div>
      </div>
    );
  };

  const onProfileSave = async () => {
    const updatedProfile = await fetchAuthorProfile({
      authorId: profile.id as string,
    });
    const parsedUpdatedProfile = parseFullAuthorProfile(updatedProfile);

    setFullAuthorProfile(parsedUpdatedProfile);
    revalidateAuthorProfile(profile.id);
  };

  useEffect(() => {
    (async () => {
      // This is necessary in order to have author data appear in the "edit profile" modal
      await dispatch(AuthorActions.getAuthor({ authorId: profile.id }));
    })();
  }, []);

  const [isShowingAll, setIsShowingAll] = useState(false);
  const [isShowingFullDescription, setIsShowingFullDescription] = useState(false);
  const visibleInstitutions = isShowingAll ? profile.education : profile.education.slice(0, 1);

  return (
    <div>
      <UserInfoModal onSave={onProfileSave} />
      <div className={css(styles.bannerSection)}>
        <WelcomeToProfileBanner profile={profile} />
      </div>
      <div className={css(styles.bioSection, styles.section)}>
        <Avatar
          src={profile.profileImage}
          sx={{ width: 128, height: 128, fontSize: 48 }}
        >
          {isEmpty(profile.profileImage) &&
            profile.firstName?.[0] + profile.lastName?.[0]}
        </Avatar>
        <div className={css(styles.lineItems)}>
          <div className={css(styles.name)}>
            {profile.firstName} {profile.lastName}
            {profile.isVerified && (
              <VerifiedBadge height={32} width={32} />
            )}
          </div>
          <div className={css(styles.headline)}>{profile.headline}</div>
          <div className={css(styles.inlineLineItem)}>
            <div className={css(styles.label)}>
              <FontAwesomeIcon icon={faBuildingColumns} fontSize={20} />
            </div>

            {profile.education.length === 0 ? (
              <>
                {/* Kobe 07-27-24: Temporarily disabling rendering of new institutions */}
                <AuthorInstitutions institutions={profile.institutions} />
              </>
            ): (
              <>
              {visibleInstitutions.map((edu, index) => (
                <div>
                  {edu.summary} {index < profile.education.length ? "" : ", "}
                </div>
              ))}
              {profile.education.length > 1 && (
                <div className={css(styles.showMore)} onClick={() => setIsShowingAll(!isShowingAll)}>
                  {isShowingAll ? "Show less" : `+ ${profile.education.length - visibleInstitutions.length} more`}
                </div>
              )}
              </>
            )}

          </div>

          {(profile?.description?.length || 0) > 0 && (
            <div className={css(styles.inlineLineItem, styles.descriptionLineItem)}>
              <div className={css(styles.description)}>
                {isShowingFullDescription ? profile.description: truncateText(profile.description, 300)}
                <div className={css(styles.showMore)} style={{ marginTop: 3, }} onClick={() => setIsShowingFullDescription(!isShowingFullDescription)}>
                  {isShowingFullDescription ? "Show less" : `Show more`}
                </div>
              </div>
            </div>
          )}

          <div className={css(styles.authorSocialMedia)}>
            <AuthorSocialMediaIcons profile={profile} />
          </div>


          {currentUser?.authorProfile.id === profile.id && (
            <div className={css(styles.textBtn, styles.editProfileBtn)}>
              <GenericMenu
                softHide={true}
                options={authorMenuOptions}
                width={200}
                id="edit-profile-menu"
                direction="bottom-right"
              >
                <IconButton overrideStyle={styles.btnDots}>
                  <FontAwesomeIcon icon={faEllipsis} />
                </IconButton>
              </GenericMenu>
            </div>
          )}
        </div>
      </div>

      <div className={css(styles.subSections)}>
        <div className={css(styles.section, styles.subSection)}>
          <div className={css(styles.sectionHeader)}>
            Achievements
            <Pill text={String(profile.achievements.length)} />
          </div>
          <AuthorHeaderAchievements profile={profile} />
        </div>

        <div className={css(styles.section, styles.subSection)}>
          <div className={css(styles.sectionHeader)}>Key Stats</div>
          <AuthorHeaderKeyStats profile={profile} />
        </div>

        <div
          className={css(
            styles.section,
            styles.subSection,
            styles.repSubsection,
            !profile.hasVerifiedPublications &&
              styles.expertiseSectionUnverified
          )}
        >
          <div className={css(styles.sectionHeader)}>
            <div>
              {profile.hasVerifiedPublications && (
                <div className={css(styles.expertiseHeader)}>Reputation</div>
              )}
              {!profile.hasVerifiedPublications && (
                <Tooltip
                  title={getExpertiseTooltipContent()}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: 14,
                        bgcolor: colors.YELLOW2(),
                      },
                    },
                  }}
                >
                  <div
                    className={css(
                      styles.expertiseHeader,
                      styles.expertiseHeaderPending
                    )}
                  >
                    Reputation
                    <PendingBadge />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
          <AuthorHeaderExpertise profile={profile} />
        </div>
      </div>
    </div>
  );
};
const styles = StyleSheet.create({
  btnDots: {
    fontSize: 22,
    borderRadius: "50px",
    color: colors.BLACK(1.0),
    background: colors.LIGHTER_GREY(),
    border: `1px solid ${colors.LIGHTER_GREY()}`,
    padding: "6px 12px",
    ":hover": {
      background: colors.DARKER_GREY(0.2),
      transition: "0.2s",
    },
  },  
  showMore: {
    color: colors.NEW_BLUE(),
    cursor: "pointer",
    marginTop: 1,
    fontSize: 14,
    ":hover": {
      textDecoration: "underline",
    }
  },  
  lineItems: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  inlineLineItem: {
    display: "flex",
    columnGap: "10px",
    color: colors.BLACK(0.9),
    alignItems: "flex-start",
    lineHeight: 1.25,
  },
  label: {
    fontWeight: 500,
    color: colors.BLACK(1.0),
  },
  description: {
    display: "inline-flex",
    flexWrap: "wrap",

  },
  descriptionLineItem: {
    marginTop: 10,
  },
  textBtn: {
    cursor: "pointer",
    color: colors.NEW_BLUE(),
  },
  editProfileBtn: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  repSubsection: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    color: "rgb(139, 137, 148, 1)",
    textTransform: "uppercase",
    fontWeight: 500,
    letterSpacing: "1.2px",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  expertiseHeader: {
    columnGap: "5px",
    display: "flex",
    alignItems: "center",
  },
  expertiseHeaderPending: {
    cursor: "pointer",
  },
  expertiseContentWrapper: {},
  expertiseContent: {},
  expertiseContentTitle: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 5,
  },
  expertiseContentBody: {
    fontSize: 14,
  },
  expertiseSectionUnverified: {
    border: `1px solid ${colors.YELLOW2()}`,
    backgroundColor: "rgb(255, 252, 241)",
  },
  repScore: {
    fontWeight: 500,
    fontSize: 15,
    color: colors.BLACK(),
  },
  bannerSection: {
    marginTop: 20,
  },
  authorSocialMedia: {
    marginTop: 10,
  },
  headline: {
    fontSize: 18,
    marginBottom: 10,
    color: colors.BLACK(0.9),
  },
  institutions: {
    marginTop: 10,
  },
  profilePage: {
    width: "1000px",
    margin: "0 auto",
  },
  bioSection: {
    columnGap: "20px",
    display: "flex",
    marginTop: 20,
    position: "relative",
  },
  section: {
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 20,
    border: "1px solid #F5F5F9",
    padding: 20,
  },
  subSections: {
    display: "flex",
    gap: 20,
    marginTop: 20,
    height: 230,
  },
  subSection: {
    width: "33%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 26,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 10
  },
});

export default AuthorProfileHeader;
