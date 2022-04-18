import { useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Typography, Button } from "@mui/material";

import { useForm } from "react-hook-form";

import { useDropzone } from "react-dropzone";

import { makeStyles } from "@mui/styles";

import { toast } from "react-toastify";

import { api } from "../../services/api";

import { LoadingSpinner } from "../../components/LoadingSpinner";

import { IImageImgur } from "../../types";

const useStyles: any = makeStyles(() => ({
  container: {
    padding: "32px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  eventsContainer: {
    display: "flex",
    gap: "16px",
  },
  headerWrapper: {
    width: "100%",
    height: "40px",
    marginBottom: "32px",
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  eventWrapper: {
    maxWidth: "20%",
    flexGrow: 1,
    padding: "16px",
    borderRadius: "10px",
    border: "solid #fff 1px",
  },
  eventImage: {
    width: "100%",
  },
  eventLabel: {
    fontWeight: 500,
    paddingBottom: "16px",
  },
  eventActions: {
    paddingTop: "16px",
    width: "100%",
    display: "flex",
    flexDirection: "row-reverse",
    gap: "16px",
  },
}));

export const NewEvents = () => {
  const classes = useStyles();

  const navigate = useNavigate();

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);

  const [previewImageSelectedWithUpload, setPreviewImageSelectedWithUpload] =
    useState<string>("");
  const [fastPreviewImageSelected, setFastPreviewImageSelected] =
    useState<string>("");

  const [imgurImageInfos, setImgurImageInfos] = useState<IImageImgur | null >(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleFile = async (fileAccepted?: any, fileRejected?: any) => {
    try {
      if (fileRejected) {
        fileRejected?.map((file: any) => {
          file?.errors?.map((errors: any) => {
            if (errors?.code === "file-invalid-type") {
              toast.error(`${errors?.message}`);
            }

            if (errors?.code === "file-too-large") {
              toast.error("File is larger than 10 MB");
            }

            return;
          });
        });
      }

      if (fileAccepted && fileAccepted[0]) {
        const file = fileAccepted[0];
        setFastPreviewImageSelected(URL.createObjectURL(file));

        let imageFormData = new FormData();

        imageFormData.append("image", file);

        setIsUploadingImage(true);

        await api()
          .post("/image/upload", imageFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res: any) => {
            const { data } = res;

            if (res.status === 200 && data.image_link) {
              setIsUploadingImage(false);
              setImgurImageInfos(data)
              setPreviewImageSelectedWithUpload(data.image_link);
              toast.success("Image upload successfully!");
            } else {
              setIsUploadingImage(false);
              toast.error("Image upload failed, try again...");
            }
          });
      }
    } catch (error) {
      setIsUploadingImage(false);
      toast.error("Image upload failed, try again...");
    }
  };

  const onDrop = useCallback(
    (acceptedFiles?: any, fileRejections?: any) => {
      handleFile(acceptedFiles, fileRejections);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    accept: "image/jpeg, image/png, image/jpg, image/gif",
    maxSize: 10000000,
    onDrop,
  });

  const onSubmitForm = async (data: any) => {
    try {
      const { eventName, eventDescription } = data;

      const objectCreateEvent = {
        title: eventName,
        description: eventDescription,
        ...imgurImageInfos
      };

      await api()
        .post("/events/create", objectCreateEvent)
        .then((res: any) => {
          const { data } = res;

          if (res.status === 200) {
            toast.success(data.message);

            setTimeout(() => {
              toast.success('Você será redirecionado!');
              navigate('/admin')
            }, 2000)
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const removeImage = async () => {
    try {
      setIsDeletingImage(true);

      await api()
        .delete(`/image/${imgurImageInfos?.image_hash}`)
        .then((res: any) => {
          const { data } = res;

          if (
            res.status === 200 &&
            data.message === "Imagem deletada com sucesso!"
          ) {
            setIsDeletingImage(false);
            toast.success(data.message);
            setPreviewImageSelectedWithUpload("");
            setFastPreviewImageSelected("");
            setImgurImageInfos(null)
          }
        });
    } catch (error) {
      setIsDeletingImage(false);
      toast.error("Erro ao deletar a imagem, tenta novamente...");
      console.log(error);
    }
  };

  const title = watch('eventName');
  const description = watch('eventDescription')

  const disableButtons = isUploadingImage || isDeletingImage || isSubmitting;

  const canSubmit = Boolean(!disableButtons && title && description && fastPreviewImageSelected)


  return (
    <div className={classes.container}>
      <div className={classes.headerWrapper}>
        <Typography
          variant="h1"
          sx={{
            margin: "5px 0 50px 0",
            fontSize: "25px",
            fontWeight: "500",
            fontStyle: "italic",
          }}
        >
          Novo evento
        </Typography>
      </div>

      <div className={classes.eventsContainer}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div>
            <label htmlFor="eventName">Nome do Evento</label>
            <input
              type="text"
              id="eventName"
              {...register("eventName", {
                required: true,
              })}
              placeholder="Digite o nome do Evento"
            />
            {errors.eventName?.type === "required" &&
              "Nome do evento necessário!"}
          </div>
          <div>
            <label htmlFor="eventDescription">Descrição do Evento</label>
            <textarea
              id="eventDescription"
              {...register("eventDescription", {
                required: true,
              })}
              placeholder="Digite a Descrição do Evento"
            />
            {errors.eventDescription?.type === "required" &&
              "Nome do evento necessário!"}
          </div>

          <div
            {...getRootProps({
              className: "dropzone",
            })}
          >
            {isUploadingImage ||
            (isDeletingImage && !fastPreviewImageSelected) ? (
              <LoadingSpinner />
            ) : fastPreviewImageSelected ? (
              <>
                {isUploadingImage || (isDeletingImage && <LoadingSpinner />)}

                <img
                  style={{
                    width: "200px",
                    height: "200px",
                  }}
                  alt="Image uploaded"
                  src={
                    previewImageSelectedWithUpload
                      ? previewImageSelectedWithUpload
                      : fastPreviewImageSelected
                  }
                />

                <Button onClick={removeImage} disabled={disableButtons}>
                  Remove image
                </Button>
              </>
            ) : (
              <>
                <div>
                  <input {...getInputProps()} disabled={disableButtons} />
                  <p>Drag files here</p>
                </div>

                <div>
                  <Button onClick={open} disabled={disableButtons}>
                    Upload image
                  </Button>
                </div>
              </>
            )}
          </div>

          <Button variant="outlined" type="submit" disabled={!canSubmit}>
            Criar
          </Button>
        </form>
      </div>
    </div>
  );
};