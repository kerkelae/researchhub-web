import { useState } from "react";
import PropTypes from "prop-types";
import SidebarSectionContent from "~/components/Notebook/SidebarSectionContent";
import { css, StyleSheet } from "aphrodite";
import { createNewNote } from "~/config/fetch";
import icons from "~/config/themes/icons";
import colors from "~/config/themes/colors";
import Loader from "~/components/Loader/Loader";
import { NOTE_GROUPS } from "./config/notebookConstants";
import { captureError } from "~/config/utils/error";
import { isOrgMember } from "~/components/Org/utils/orgHelper";

const NotebookSidebarGroup = ({
  groupKey,
  availGroups,
  notes,
  titles,
  orgs,
  currentOrg,
  user,
  currentNoteId,
  onNoteCreate,
  onNoteDelete,
  refetchTemplates,
  setRefetchTemplates,
}) => {
  const [createNoteIsLoading, setCreateNoteIsLoading] = useState(false);

  const handleCreateNewNote = async (groupKey) => {
    setCreateNoteIsLoading(true);

    try {
      const note = await createNewNote({
        orgSlug: currentOrg.slug,
        grouping: groupKey,
      });

      // TODO: Remove once Leo adds this to endpoint
      note.access = groupKey;
      onNoteCreate(note);
    } catch (error) {
      captureError({
        error,
        msg: "Failed to create note",
        data: { currentNoteId, groupKey, orgSlug: currentOrg.slug },
      });
    } finally {
      setCreateNoteIsLoading(false);
    }
  };

  const allowedToCreateNote = [
    NOTE_GROUPS.WORKSPACE,
    NOTE_GROUPS.PRIVATE,
  ].includes(groupKey);

  const allowedToSeeOptions = isOrgMember({ user, org: currentOrg });

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.groupHead)}>
        <div className={css(styles.title)}>{groupKey}</div>
        {allowedToCreateNote && (
          <div className={css(styles.new)}>
            {createNoteIsLoading ? (
              <Loader type="clip" size={23} />
            ) : (
              <div
                className={css(styles.actionButton) + " actionButton"}
                onClick={() => handleCreateNewNote(groupKey)}
              >
                {icons.plus}
              </div>
            )}
          </div>
        )}
      </div>
      {notes.length === 0 && (
        <div
          className={css(styles.newNoteButton)}
          onClick={() => handleCreateNewNote(groupKey)}
        >
          <span className={css(styles.plusIcon)}>{icons.plus}</span> Create new
          note
        </div>
      )}
      {notes.map((note) => (
        <SidebarSectionContent
          key={note.id}
          groupKey={groupKey}
          currentOrg={currentOrg}
          currentNoteId={currentNoteId}
          noteId={note.id.toString()}
          onNoteCreate={onNoteCreate}
          onNoteDelete={onNoteDelete}
          refetchTemplates={refetchTemplates}
          setRefetchTemplates={setRefetchTemplates}
          title={titles[note.id]}
          showOptions={allowedToSeeOptions}
        />
      ))}
    </div>
  );
};

NotebookSidebarGroup.propTypes = {
  groupKey: PropTypes.oneOf([
    NOTE_GROUPS.WORKSPACE,
    NOTE_GROUPS.SHARED,
    NOTE_GROUPS.PRIVATE,
  ]),
  notes: PropTypes.array,
};

const styles = StyleSheet.create({
  newNoteButton: {
    color: colors.PURPLE(1),
    fontSize: 14,
    fontWeight: 500,
    padding: "20px 40px 20px 20px",
    borderTop: `1px solid ${colors.GREY(0.3)}`,
    cursor: "pointer",
    ":hover": {
      backgroundColor: colors.GREY(0.3),
    },
    ":last-child": {
      borderBottom: `1px solid ${colors.GREY(0.3)}`,
    },
  },
  plusIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  groupHead: {
    color: colors.BLACK(),
    cursor: "pointer",
    display: "flex",
    fontWeight: 500,
    padding: "20px 10px 20px 20px",
    userSelect: "none",
    alignItems: "center",
    ":hover .actionButton": {
      opacity: 1,
    },
  },
  title: {
    textTransform: "capitalize",
    fontSize: 14,
    fontWeight: 600,
    color: colors.BLACK(0.5),
  },
  new: {
    marginLeft: "auto",
  },
  actionButton: {
    alignItems: "center",
    background: colors.LIGHT_GREY(),
    color: colors.PURPLE(1),
    border: "1px solid #ddd",
    borderRadius: "50%",
    display: "flex",
    fontSize: 16,
    height: 25,
    width: 25,
    justifyContent: "center",
    transition: "all ease-in-out 0.1s",
    ":hover": {
      backgroundColor: colors.GREY(0.3),
    },
  },
});

export default NotebookSidebarGroup;
