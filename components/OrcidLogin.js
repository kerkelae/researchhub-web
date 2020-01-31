import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { AuthActions } from "../redux/auth";

const LOGIN_ATTEMPT_TIMEOUT = 300000; // 5 minutes
const WATCH_WINDOW_INTERVAL = 500; // 5 ms

const OrcidLogin = (props) => {
  const { clientId, onFailure, onSuccess, redirectUri, render } = props;

  const dispatch = useDispatch();

  const [loginWindow, setLoginWindow] = useState(null);

  const [timedOut, setTimedOut] = useState(false);

  const [closed, setClosed] = useState(false);

  const [windowTimeout, setWindowTimeout] = useState(null);

  const [windowClosedInterval, setWindowClosedInterval] = useState(null);

  const [windowDomainInterval, setWindowDomainInterval] = useState(null);

  useEffect(timedOutEffect, [timedOut]);
  function timedOutEffect() {
    if (timedOut && loginWindow) {
      loginWindow.close();
    }
  }

  useEffect(closedEffect, [closed]);
  function closedEffect() {
    if (closed) {
      setLoginWindow(null);
      clearHandlers();
      checkLogin();
    }
  }

  useEffect(watchWindowClose, [loginWindow, windowClosedInterval]);
  function watchWindowClose() {
    if (loginWindow && !windowClosedInterval) {
      setWindowClosedInterval(
        setInterval(() => {
          setClosed(loginWindow.closed);
        }, WATCH_WINDOW_INTERVAL)
      );
    }
  }

  useEffect(watchWindowDomain, [loginWindow, windowDomainInterval]);
  function watchWindowDomain() {
    if (loginWindow && !windowDomainInterval) {
      setWindowDomainInterval(
        setInterval(() => {
          try {
            checkLoginComplete(loginWindow.document.body);
          } catch (e) {
            console.log(e, "Not on our domain yet");
          }
        }, WATCH_WINDOW_INTERVAL)
      );
    }
  }

  function clearHandlers() {
    clearTimeout(windowTimeout);
    setWindowTimeout(null);
    clearInterval(windowClosedInterval);
    setWindowClosedInterval(null);
    clearInterval(windowDomainInterval);
    setWindowDomainInterval(null);
  }

  function checkLoginComplete(loginWindowBody) {
    const loginComplete = checkBaseUriSuccessParam(loginWindowBody);
    if (loginComplete) {
      loginWindow.close();
      onSuccess();
    }
  }

  function checkBaseUriSuccessParam(body) {
    const uri = body["baseURI"];
    const regex = RegExp("success");
    return regex.test(uri);
  }

  const renderProps = {
    onClick: onClick,
    disbled: false,
  };

  function onClick() {
    openWindow();
    closeWindowOnTimeout();
  }

  function openWindow() {
    const url = buildOrcidUrl();
    const windowStyle =
      "toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500";
    setLoginWindow(window.open(url, "_blank", windowStyle));
  }

  function closeWindowOnTimeout() {
    setWindowTimeout(
      setTimeout(() => {
        setTimedOut(true);
      }, LOGIN_ATTEMPT_TIMEOUT)
    );
  }

  function buildOrcidUrl() {
    return (
      "https://orcid.org/oauth/authorize?client_id=" +
      clientId +
      "&response_type=code" +
      "&scope=/authenticate" +
      "&redirect_uri=" +
      redirectUri
    );
  }

  return render(renderProps);
};

OrcidLogin.propTypes = {
  clientId: PropTypes.string.isRequired,
  onFailure: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  redirectUri: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
};

export default OrcidLogin;
