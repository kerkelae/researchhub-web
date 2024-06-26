import { StyleSheet, css } from "aphrodite";
import { Fragment } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

import ComponentWrapper from "~/components/ComponentWrapper";
import colors, { genericCardColors } from "~/config/themes/colors";
import SearchResultsForDocs from "~/components/Search/SearchResultsForDocs";
import SearchResultsForPeople from "~/components/Search/SearchResultsForPeople";
import SearchResultsForHubs from "~/components/Search/SearchResultsForHubs";
import SearchEmpty from "~/components/Search/SearchEmpty";
import { breakpoints } from "~/config/themes/screen";
import { hasNoSearchResults } from "~/config/utils/search";

const SearchBestResults = ({ apiResponse }) => {
  const router = useRouter();
  const maxResultsPerSection = 2;
  const entityToHumanReadable = {
    person: "people",
    hub: "hubs",
    paper: "papers",
    post: "posts",
  };

  const handleSeeMoreClick = ({ key }) => {
    const updatedQuery = {
      ...router.query,
      type: key,
    };

    router.push({
      pathname: "/search/[type]",
      query: updatedQuery,
    });
  };

  const renderSeeMoreLink = ({ key, text }) => {
    return (
      <div className={css(styles.linkWrapper)}>
        <div
          className={css(styles.link)}
          onClick={() => handleSeeMoreClick({ key })}
        >
          {text}
        </div>
      </div>
    );
  };

  const renderResultSection = ({ key, results }) => {
    if (!(Array.isArray(results) && results.length > 0)) {
      return null;
    }

    return (
      <section className={`${css(styles.section)} searchResultsSection`}>
        <h2 className={css(styles.sectionHeader)}>
          {entityToHumanReadable[key]}
        </h2>
        {key === "hub" ? (
          <SearchResultsForHubs
            apiResponse={{ results, count: results.length }}
            context="best-results"
          />
        ) : key === "paper" || key === "post" ? (
          <SearchResultsForDocs
            apiResponse={{ results, count: results.length }}
            context="best-results"
            entityType={key}
          />
        ) : key === "person" ? (
          <SearchResultsForPeople
            apiResponse={{ results, count: results.length }}
            context="best-results"
          />
        ) : null}
        {results.length >= maxResultsPerSection &&
          renderSeeMoreLink({
            key,
            text: `See all ${entityToHumanReadable[key]}`,
          })}
      </section>
    );
  };

  if (hasNoSearchResults({ searchType: "all", apiResponse })) {
    return <SearchEmpty />;
  }

  return (
    <Fragment>
      <ComponentWrapper key="paper" overrideStyle={styles.componentWrapper}>
        {renderResultSection({ key: "paper", results: apiResponse["paper"] })}
      </ComponentWrapper>
      <ComponentWrapper key="post" overrideStyle={styles.componentWrapper}>
        {renderResultSection({ key: "post", results: apiResponse["post"] })}
      </ComponentWrapper>
      <ComponentWrapper key="hub" overrideStyle={styles.componentWrapper}>
        {renderResultSection({ key: "hub", results: apiResponse["hub"] })}
      </ComponentWrapper>
      <ComponentWrapper key="person" overrideStyle={styles.componentWrapper}>
        {renderResultSection({ key: "person", results: apiResponse["person"] })}
      </ComponentWrapper>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  componentWrapper: {
    marginBottom: 20,
    ":last-child": {
      paddingBottom: 30,
    },
    [`@media only screen and (max-width: ${breakpoints.xlarge.str})`]: {
      width: "100%",
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  section: {
    background: "white",
    padding: "16px 20px",
    borderRadius: "2px",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  sectionHeader: {
    paddingBottom: 10,
    marginBottom: 0,
    borderBottom: `1px solid ${colors.GREY_BORDER}`,
    color: colors.MEDIUM_GREY2(),
    fontWeight: 500,
    fontSize: 16,
    marginTop: 0,
    textTransform: "capitalize",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 14,
    },
  },
  linkWrapper: {
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    padding: "12px",
    border: "1px solid",
    borderColor: colors.NEW_BLUE(),
    borderRadius: "4px",
    display: "inline-block",
    color: colors.NEW_BLUE(),
    fontWeight: 400,
    fontSize: 14,
    letterSpacing: "0.5px",
    cursor: "pointer",
    ":hover": {
      transition: "0.2s",
      background: colors.NEW_BLUE(0.1),
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "block",
    },
  },
});

SearchBestResults.propTypes = {
  apiResponse: PropTypes.object,
};

export default SearchBestResults;
