import { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner, Image } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Job, MarkerData, Position, Config } from "./utils/types";
import { cancelJob, getJobInfo, getLocation } from "./utils/api";
import Map from "./Map";
import CustomModal from "./Modal";

import resource from './assets/resource.png'
import pin from './assets/pin.png'

import { Calendar, Clock, GeoAltFill } from "react-bootstrap-icons";

function App(config: { config: Config }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [job, setJob] = useState<Job>();
  const [markers, setMarkers] = useState<MarkerData[]>();
  const [center, setCenter] = useState<Position>();
  const [loaded, setLoaded] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [error, setError] = useState<string>();
  const [lastPoll, setLastPoll] = useState(Date.now())
  const [eta, setEta] = useState<string>()

  const [logoLoaded, setLogoLoaded] = useState(false);


  const [showCancelModal, setShowCancelModal] = useState(false);
  const handleShowCancelModal = () => setShowCancelModal(true);

  const timerIdRef = useRef<number | undefined>(undefined);
  dayjs.extend(relativeTime);

  useEffect(() => {
    const pollingCallback = async () => {
      try {
        if (!token) {
          console.error("no token provided");
          throw "no token provided";
        }
        const job = await getJobInfo(token);
        setJob(job);
        if (job.JobStatus === "Cancelled") {
          setCancelled(true);
          setOpacity(0.25);
        }
        else {
          setCancelled(false);
          setOpacity(1);
        }
        
        setLoaded(true);

        const location = await getLocation(token);
        setLastPoll(Date.now())

        setCenter({
          lat: job?.GeoLatitude ? job.GeoLatitude : 0,
          lng: job?.GeoLongitude ? job.GeoLongitude : 0,
        });

        setMarkers([
          {
            id: 1,
            name: "You",
            icon: pin,
            hidden: false,
            position: {
              lat: job?.GeoLatitude ? job.GeoLatitude : 0,
              lng: job?.GeoLongitude ? job.GeoLongitude : 0,
            },
          },
          {
            id: 2,
            name: config.config.ResourceName,
            icon: resource,
            hidden: job.JobStatus != 'En Route',
            position: {
              lat: location?.lat ? location.lat : 0,
              lng: location?.lng ? location.lng : 0,
            },
          },
        ]);

        if(job.JobStatus == 'En Route') {

          if(location.duration === 0) {
            setEta('Arrived');
          }
          else {
            setEta(
              location.duration && location.duration !== 0 ? `${Math.ceil(location.duration/60)} minutes away` : 'ETA Unknown'
            )
          }
         
        }
        else {
          setEta(job.JobStatus)
        }

      } catch (error) {
        let msg = "Unknown error occured";
        if (error instanceof Error) {
          msg = error.message;
        }
        setError(msg);
        setIsPollingEnabled(false);
        console.error(msg);
      }
    };

    const startPolling = () => {
      pollingCallback();
      timerIdRef.current = setInterval(pollingCallback, 1000);
    };

    const stopPolling = () => {
      clearInterval(timerIdRef.current);
    };

    if (isPollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPollingEnabled]);

  const handleCanceJob = async () => {
    if (!token) {
      throw "no token";
    }
    await cancelJob(token);
    setShowCancelModal(false);
    setCancelled(true);
    setOpacity(0.25);
  };

  if (error) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            top: "50%",
            textAlign: "center",
          }}
        >
          <style type="text/css">
            {`
        .btn-custom {
          background-color: ${config.config.BrandPrimaryColour} !important;
          color: ${config.config.BrandSecondaryColour}} !important;
        }
        .bg-custom {
          background-color: ${config.config.BrandPrimaryColour} !important;
        }
        .main-div {
          opacity: ${opacity}
        }
        .job-div {
          top: 50%
        }
      `}
          </style>
          <h2>
            <strong>
              <p>
                An error has occured loading this page, please contact support
              </p>
            </strong>
          </h2>

          <Button href={`tel:${config.config.SupportPhone}`} variant="custom">
            Contact Support
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <style type="text/css">
        {`
        .btn-custom {
          background-color: ${config.config.BrandPrimaryColour} !important;
          color: ${config.config.BrandSecondaryColour}} !important;
        }
        .bg-custom {
          background-color: ${config.config.BrandPrimaryColour} !important;
        }
        .main-div {
          opacity: ${opacity}
        }
        .job-div {
          top: 50%
        }
      `}
      </style>

      <div id="loading-spinner" hidden={loaded}>
        <Spinner
          style={{
            position: "fixed",
            top: "50%",
            left: "45%",
          }}
        ></Spinner>
      </div>

      <div className="main-div" hidden={!loaded && !logoLoaded}>
        <CustomModal
          closeButton="Close"
          okButton="Cancel"
          title={`Cancel ${config.config.JobName}?`}
          show={showCancelModal}
          closeButtonAction={handleCanceJob}
        >
          {`Are you sure you want to cancel your ${config.config.JobName}?`}
        </CustomModal>

        <Card style={{ width: "100%", height: "100%" }}>
          <Card.Header style={{backgroundColor:config.config.BrandSecondaryColour}}>
            <Image style={{maxHeight:"2em"}}src={config.config.LogoURL} onLoad={() => {setLogoLoaded(true)}}/>

          </Card.Header>

          <div
            id="map-container"
          >
            <Card.Body>
              <Container>
                <Row>
                  <Col xs={3}>
                    <Image src={job?.ResourceAviURL} roundedCircle />
                  </Col>
                  <Col>
                    <Row>
                      <Col>
                        <h5>{job?.ResourceFirstName}</h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <strong>{eta}</strong>
                      </Col>
                    </Row>
                    <Row>
                      <Col style={{ color: "grey" }}>Last Updated {dayjs(lastPoll).format("h:mm A")}</Col>
                    </Row>
                  </Col>
                </Row>
              </Container>


              <div style={{ paddingTop: "1em" }}>
              {(markers && center) &&
                <Map
                  markers={markers}
                  center={center}
                  apiKey={config.config.GoogleMapsAPIKey}
                ></Map>
              }
              </div>
            </Card.Body>
            <hr></hr>
          </div>

          <div id="job-details-container">
            <Card.Body>
              <Container>
                <Row>
                  <Col>
                    <h4> {job?.Description} </h4>
                  </Col>
                </Row>
                <Row>
                  <Col style={{ paddingTop: "0.5em" }}>
                    <Calendar /> {dayjs(job?.Start).format("dddd, DD MMMM YYYY")}{" "}
                  </Col>
                </Row>
                <Row>
                  <Col style={{ paddingTop: "0.5em" }}>
                    <Clock /> {dayjs(job?.Start).format("h:mm A")} -{" "}
                    {dayjs(job?.End).format("h:mm A")} ({job?.Duration} mins)
                  </Col>
                </Row>
                <Row>
                  <Col style={{ paddingTop: "0.5em" }}>
                    <GeoAltFill /> {job?.Address}{" "}
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </div>

          <div
            id="special-instructions-container"
            hidden={!job?.SpecialInstructions}
          >
            <hr></hr>
            <Card.Body style={{ paddingBottom: "2em" }}>
              <Container>
                <Row>
                  <Col style={{ color: "darkgray" }}>Special Instructions </Col>
                </Row>
                <Row>
                  <Col> {job?.SpecialInstructions} </Col>
                </Row>
              </Container>
            </Card.Body>
          </div>

          <div id="controls-container">
            <Card.Body style={{ background: "#F3F5F9" }}>
              <Container>
                <Row>
                  <p>
                    <h5>Need to reschedule?</h5>
                  </p>
                </Row>
                <Row>
                  <p>
                    You can cancel this {config.config.JobName} and we'll be in
                    touch as soon as possible to confirm a new date.
                  </p>
                </Row>
                <Row>
                  <Button
                    variant="primary"
                    onClick={handleShowCancelModal}
                    style={{ minHeight: "3.5em" }}
                  >
                    Cancel {config.config.JobName}
                  </Button>
                </Row>
                <Row>
                  <Button
                    href={`https://kkh-demo.my-dev.test.skl.io/pages/openai/`}
                    target="_blank"
                    variant="dark"
                    style={{ minHeight: "3.5em" }}
                  >
                    Ask AI
                  </Button>
                </Row>
              </Container>
            </Card.Body>
          </div>
        </Card>
      </div>

      <div
        id="job-cancelled-message-container"
        hidden={!cancelled}
        style={{
          position: "fixed",
          top: "50%",
          textAlign: "center",
          left: "5%",
        }}
      >
        <h2>
          <strong>Your {config.config.JobName} has been cancelled</strong>
        </h2>
      </div>
    </>
  );
}

export default App;
