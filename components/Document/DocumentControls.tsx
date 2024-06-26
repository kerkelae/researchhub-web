import config from "~/components/Document/lib/config";
import { StyleSheet, css } from "aphrodite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMaximize, faCompress } from "@fortawesome/pro-light-svg-icons";
import IconButton from "../Icons/IconButton";
import colors from "~/config/themes/colors";
import DocumentZoomControls from "./lib/DocumentZoomControls";
import DocumentCommentMenu from "~/components/Document/DocumentCommentMenu";
import { breakpoints } from "~/config/themes/screen";
import { LEFT_MAX_NAV_WIDTH, LEFT_MIN_NAV_WIDTH } from "../ReferenceManager/basic_page_layout/BasicTogglableNavbarLeft";

interface Props {
  handleFullScreen: Function;
  handleZoomIn: Function;
  handleZoomOut: Function;
  handleZoomSelection: Function;
  currentZoom: number;
  showExpand: boolean;
  showCommentMenu?: boolean;
  isExpanded?: boolean;
  annotationCount?: number;
  documentType?: string;
}

const DocumentControls = ({
  handleFullScreen,
  handleZoomIn,
  handleZoomOut,
  handleZoomSelection,
  currentZoom,
  showExpand = true,
  isExpanded = false,
  showCommentMenu = false,
  annotationCount = 0,
  documentType,
}: Props) => {
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={css(
        styles.controls,
        styles.controlsSticky,
        isExpanded && styles.controlsStickyExpanded
      )}
      onClick={stopPropagation}
    >
      <DocumentZoomControls
        currentZoom={currentZoom}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleZoomSelection={handleZoomSelection}
      />

      {showCommentMenu && (
        <>
          <div className={css(styles.divider)} />
          <DocumentCommentMenu annotationCount={annotationCount} />
        </>
      )}

      {showExpand && (
        <>
          <div className={css(styles.divider)} />
          <IconButton
            overrideStyle={styles.icon}
            onClick={(e) => {
              e.stopPropagation();
              handleFullScreen();
            }}
          >
            <FontAwesomeIcon
              icon={isExpanded ? faCompress : faMaximize}
              style={{ fontSize: 20 }}
            />
          </IconButton>
        </>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    zIndex: 99,
    right: 0,
    top: 25,
    marginTop: -10,
    display: "flex",
    columnGap: "10px",
    justifyContent: "flex-end",
    background: "white",
    paddingLeft: 15,
    paddingBottom: 15,
    border: "1px solid #aeaeae",
  },
  controlsSticky: {
    position: "fixed",
    left: `calc(50% - ${(config.controlsWidth / 2)}px + ${LEFT_MAX_NAV_WIDTH / 2}px )`,
    top: "unset",
    right: "unset",
    zIndex: 9999999,
    bottom: 40,
    display: "flex",
    columnGap: "10px",
    justifyContent: "flex-end",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)",
    userSelect: "none",
    padding: "8px 15px",
    borderRadius: "42px",

    [`@media (max-width: 1200px)`]: {
      left: `calc(50% - ${(config.controlsWidth / 2)}px + ${LEFT_MIN_NAV_WIDTH / 2}px )`,
    },

    [`@media (max-width: 1100px)`]: {
      transform: "unset",
      bottom: 30,
    },

    [`@media (max-width: ${breakpoints.xsmall.str})`]: {
      left: `calc(50% - ${(config.controlsWidth / 2)}px)`,
    },    

  },
  controlsStickyExpanded: {
    left: `50%`,
    transform: "translateX(-50%)",
    [`@media (max-width: 1100px)`]: {
      left: `50%`,
      transform: "translateX(-50%)",
    },
  },
  divider: {
    borderRight: `1px solid ${colors.BLACK(1.0)}`,
    height: "20px",
    marginTop: 7,
  },
  closeBtn: {
    borderRadius: 50,
    padding: 7,
  },
  icon: {
    color: colors.BLACK(1.0),
  },
});

export default DocumentControls;
