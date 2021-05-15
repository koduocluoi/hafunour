import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Grid, Col} from "react-bootstrap";
import { API, Storage } from "aws-amplify";
import PrintableProductTable from "../../components/PrintableProductTable";
import { onError } from "../../libs/errorLib";
import "./index.css";

export default function Receipt() {
    const {historyId} = useParams();
    const [history, setHistory] = useState({});
    const [attachmentUrls, setAttachmentUrls] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        function loadHistory() {
            return API.get("kmc", `/history/${historyId}`);
        }

        async function getUrls(attachments) {
            var urls = [];
            for (var i = 0; i < attachments.length; i++) {
                const url = await Storage.vault.get(attachments[i]);
                urls.push(url);
            }

            return urls;
        }

        async function onLoad() {
            try {
                const response = await loadHistory();
                if (response.code != '200') {
                    onError(response.message);
                    return;
                } else {
                    const {attachments} = response.history;
                    if (attachments != null) {
                        setAttachmentUrls(await getUrls(attachments));
                    } else {
                        setAttachmentUrls([]);
                    }
                    setHistory(response.history);
                    setIsLoadingData(false);
                }
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [historyId]);

    function displayImageReviews(urls) {
        return urls.map((url, index) => (<img key={index} src={url}/>));
    }

    return (
        <div className="receipt">
            <p> {`MHD: ${historyId}`} </p>
            <PrintableProductTable id="product-table" data={[history]} />
            <Grid>
                <Col xs={12} md={8}>
                    Ghi chú
                </Col>
                <Col xs={6} md={4}>
                    {`Tru tien: ${history.reducedPrice}`}
                </Col>
            </Grid>
            <div className="imagePreview">
                {displayImageReviews(attachmentUrls)}
            </div>
        </div>
    )
}
