import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import LoaderButton from "../../components/LoaderButton";
import config from "../../config";
import "./Notes.css";
import { onError } from "../../libs/errorLib";

export default function Product() {
    const file = useRef(null);
    const { id } = useParams();
    const history = useHistory();
    const [product, setProduct] = useState(null);
    const [type, setType] = useState("");

    useEffect(() => {
        function loadProduct() {
            return API.get("kmc", `/products/${id}`);
        }

        async function onLoad() {
            try {
                const product = await loadProduct();
                const { type, attachment } = product;

                if (attachment) {
                    product.attachmentURL = await Storage.vault.get(attachment);
                }

                setType(type);
                setProduct(note);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [id]);

    function validateForm() {
        return content.length > 0;
    }

    function formatFilename(str) {
        return str.replace(/^\w+-/, "");
    }

    function handleFileChange(event) {
        file.current = event.target.files[0];
    }

    async function handleSubmit(event) {
        let attachment;

        event.preventDefault();

        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
                    1000000} MB.`
            );
            return;
        }

        setIsLoading(true);
    }

    async function handleDelete(event) {
        event.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
    }

    return (
        <div className="Notes">
        {note && (
            <form onSubmit={handleSubmit}>
            <FormGroup controlId="content">
            <FormControl
            value={content}
            componentClass="textarea"
            onChange={e => setContent(e.target.value)}
            />
            </FormGroup>
            {note.attachment && (
                <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static>
                <a
                target="_blank"
                rel="noopener noreferrer"
                href={note.attachmentURL}
                >
                {formatFilename(note.attachment)}
                </a>
                </FormControl.Static>
                </FormGroup>
            )}
            <FormGroup controlId="file">
            {!note.attachment && <ControlLabel>Attachment</ControlLabel>}
            <FormControl onChange={handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
            block
            type="submit"
            bsSize="large"
            bsStyle="primary"
            isLoading={isLoading}
            disabled={!validateForm()}
            >
            Save
            </LoaderButton>
            <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            >
            Delete
            </LoaderButton>
            </form>
        )}
        </div>
    );
}
