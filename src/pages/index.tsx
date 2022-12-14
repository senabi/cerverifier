import { Url } from "@prisma/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { urlValidator, UrlValidatorType } from "../shared/url";
import { trpc } from "../utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { GiPlainCircle as CircleIcon } from "react-icons/gi";
import { IoLockClosed as ChromeSecureIcon } from "react-icons/io5";
import { RiErrorWarningLine as ChromeWarnIcon } from "react-icons/ri";
import { RiAlertFill as ChromeDangerIcon } from "react-icons/ri";
import { HiOutlineLockClosed as FirefoxSecureIcon } from "react-icons/hi2";
import { MdWarning as FirefoxTriangleIcon } from "react-icons/md";
import { HiOutlineLockClosed as FirefoxLockIcon } from "react-icons/hi2";
import { BsSlashLg as FirefoxSlashIcon } from "react-icons/bs";
import { MdLockOutline as EdgeSecureIcon } from "react-icons/md";
import { MdWarning as EdgeWarnIcon } from "react-icons/md";
import { MdWarning as EdgeDangerIcon } from "react-icons/md";
import { GoEye as ChainIcon } from "react-icons/go";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/router";

const Modal: React.FC<React.PropsWithChildren<{ id: string }>> = ({
  id,
  children,
}) => {
  return (
    <>
      <input type="checkbox" className="modal-toggle" id={id} />
      <div className="modal">
        <div className="modal-box relative flex flex-col gap-2">
          <label
            htmlFor={id}
            className="btn btn-circle btn-sm absolute right-2 top-2"
          >
            ✕
          </label>
          {children}
        </div>
      </div>
    </>
  );
};

type Vendor = "Microsoft Edge" | "Google Chrome" | "Mozilla Firefox";
type ScoreContentType = {
  score: number;
  vendor: Vendor;
};
const ScoreContent: React.FC<ScoreContentType> = ({ score, vendor }) => {
  return (
    <div className="flex items-center justify-between px-8 sm:justify-center sm:p-0">
      <div className="sm:hidden">
        <p className="text-center">{vendor}</p>
      </div>
      <div className="flex items-center justify-center text-4xl">
        <LockType vendor={vendor} score={score} />
        <CircleIcon
          className={`px-2 ${score >= 1 ? "text-green-400" : "text-gray-500"} `}
        />
        <CircleIcon
          className={`px-2 ${score >= 2 ? "text-green-400" : "text-gray-500"}`}
        />
        <CircleIcon
          className={`px-2 ${
            score === 3 ? "text-green-400" : "text-gray-500"
          } `}
        />
      </div>
    </div>
  );
};

const LockType: React.FC<{ vendor: Vendor; score: number }> = (props) => {
  const { vendor, score } = props;
  switch (vendor) {
    case "Mozilla Firefox":
      switch (score) {
        case 3:
          return <FirefoxSecureIcon className="h-5 w-5" />;
        case 2:
          return (
            <div className="relative">
              <FirefoxLockIcon className="h-5 w-5" />
              <FirefoxTriangleIcon className="absolute bottom-0 right-0 h-3 w-3" />
            </div>
          );
        case 1:
          return (
            <div className="relative">
              <FirefoxLockIcon className="h-5 w-5" />
              <FirefoxSlashIcon className="absolute top-0 right-0 h-5 w-5 rotate-90 text-red-400" />
            </div>
          );
        default:
          return null;
      }
    case "Google Chrome":
      switch (score) {
        case 3:
          return <ChromeSecureIcon className="w-5 text-gray-400" />;
        case 2:
          return <ChromeDangerIcon className="w-5 text-red-500" />;
        case 1:
          return <ChromeWarnIcon className="w-5 rotate-180 text-gray-400" />;
        default:
          return null;
      }
    case "Microsoft Edge":
      // return null;
      switch (score) {
        case 3:
          return <EdgeSecureIcon className="w-5 text-gray-400" />;
        case 2:
          return <EdgeDangerIcon className="w-5 text-red-500" />;
        case 1:
          return <EdgeWarnIcon className="w-5 text-gray-400" />;
        default:
          return null;
      }
    default:
      return null;
  }
};

const gridClasses = "hidden rounded-lg bg-gray-700 p-4 sm:block";
const UrlItem: React.FC<{ url: Url }> = ({ url }) => {
  return (
    <>
      <div
        tabIndex={0}
        className="collapse rounded-lg border-none bg-gray-700 sm:hidden"
      >
        <div className="collapse-title flex items-center gap-2 truncate text-xl font-medium">
          <a
            className="truncate text-sky-400"
            href={`${url.tls ? "https" : "http"}://${url.host}`}
          >
            {`${url.tls ? "https" : "http"}://${url.host}`}
          </a>
        </div>
        <div className="collapse-content">
          <div className="flex flex-col gap-2">
            <ScoreContent vendor="Microsoft Edge" score={url.trustEdge} />
            <ScoreContent vendor="Google Chrome" score={url.trustChrome} />
            <ScoreContent vendor="Mozilla Firefox" score={url.trustFirefox} />
            <label
              htmlFor={`chain-modal-${url.id}`}
              className="modal-button btn btn-sm"
            >
              show chain
            </label>
          </div>
        </div>
      </div>

      <div className={gridClasses}>
        <div className="flex h-full items-center gap-2">
          <div className="tooltip" data-tip="Show Chain">
            <label
              htmlFor={`chain-modal-${url.id}`}
              className="modal-button btn btn-sm border-none bg-gray-700 text-xl hover:bg-gray-600 hover:text-white"
            >
              <ChainIcon />
            </label>
          </div>
          <a
            className="truncate text-sky-400"
            href={`${url.tls ? "https" : "http"}://${url.host}`}
          >
            {`${url.tls ? "https" : "http"}://${url.host}`}
          </a>
        </div>
      </div>
      <div className={gridClasses}>
        <ScoreContent vendor="Microsoft Edge" score={url.trust} />
      </div>
      <div className={gridClasses}>
        <ScoreContent vendor="Google Chrome" score={url.trust} />
      </div>
      <div className={gridClasses}>
        <ScoreContent vendor="Mozilla Firefox" score={url.trust} />
      </div>
      <Modal id={`chain-modal-${url.id}`}>
        <h3 className="text-lg font-bold">Certificates Chain</h3>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-3 whitespace-pre-wrap">
            {url.chainFirefox && (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-zinc-600 p-2 font-semibold">
                  Firefox Chain
                </div>
                {!(url.chainFirefox as any).authorized && (
                  <div className="rounded-lg bg-slate-600 p-2">
                    <div>Not authorized</div>
                    <div>{(url.chainChrome as any).errorCode}</div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {((url.chainFirefox as any).certs ?? []).map((cert: any) => (
                    <div
                      key={Math.random()}
                      className="rounded-lg bg-slate-600 p-2"
                    >
                      <div>
                        <span className="font-medium">Valid from: </span>
                        {cert.valid_from ?? ""}
                      </div>
                      <div>
                        <span className="font-medium">Valid to: </span>
                        {cert.valid_to ?? ""}
                      </div>
                      <div>
                        <div className="font-medium">Issuer</div>
                        {JSON.stringify(cert.issuer, null, 4)}
                      </div>
                      <div>
                        <div className="font-medium">Subject</div>
                        {JSON.stringify(cert.subject, null, 4)}
                      </div>
                      <div>
                        <div className=" font-medium">Certificate</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pem}
                        </div>
                      </div>
                      <div>
                        <div className=" font-medium">Public Key</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pubKey}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 whitespace-pre-wrap">
            {/* {url.chainChrome && (url.chainChrome as any).certs && ( */}
            {url.chainChrome && (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-zinc-600 p-2 font-semibold">
                  Google Chrome Chain
                </div>
                {!(url.chainChrome as any).authorized && (
                  <div className="rounded-lg bg-slate-600 p-2">
                    <div>Not authorized</div>
                    <div>{(url.chainChrome as any).errorCode}</div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {((url.chainChrome as any).certs ?? []).map((cert: any) => (
                    <div
                      key={Math.random()}
                      className="rounded-lg bg-slate-600 p-2"
                    >
                      <div>
                        <span className="font-medium">Valid from: </span>
                        {cert.valid_from ?? ""}
                      </div>
                      <div>
                        <span className="font-medium">Valid to: </span>
                        {cert.valid_to ?? ""}
                      </div>
                      <div>
                        <div className="font-medium">Issuer</div>
                        {JSON.stringify(cert.issuer, null, 4)}
                      </div>
                      <div>
                        <div className="font-medium">Subject</div>
                        {JSON.stringify(cert.subject, null, 4)}
                      </div>
                      <div>
                        <div className=" font-medium">Certificate</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pem}
                        </div>
                      </div>
                      <div>
                        <div className=" font-medium">Public Key</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pubKey}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 whitespace-pre-wrap">
            {url.chainEdge && (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-zinc-600 p-2 font-semibold">
                  Microsoft Edge Chain
                </div>
                <div className="flex flex-col gap-4">
                  {!(url.chainEdge as any).authorized && (
                    <div className="rounded-lg bg-slate-600 p-2">
                      <div>Not authorized</div>
                      <div>{(url.chainEdge as any).errorCode}</div>
                    </div>
                  )}
                  {((url.chainEdge as any).certs ?? []).map((cert: any) => (
                    <div
                      key={Math.random()}
                      className="rounded-lg bg-slate-600 p-2"
                    >
                      <div>
                        <span className="font-medium">Valid from: </span>
                        {cert.valid_from ?? ""}
                      </div>
                      <div>
                        <span className="font-medium">Valid to: </span>
                        {cert.valid_to ?? ""}
                      </div>
                      <div>
                        <div className="font-medium">Issuer</div>
                        {JSON.stringify(cert.issuer, null, 4)}
                      </div>
                      <div>
                        <div className="font-medium">Subject</div>
                        {JSON.stringify(cert.subject, null, 4)}
                      </div>
                      <div>
                        <div className=" font-medium">Certificate</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pem}
                        </div>
                      </div>
                      <div>
                        <div className=" font-medium">Public Key</div>
                        <div className="overflow-x-auto whitespace-pre break-words">
                          {cert.pubKey}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

type UrlGridContentParams = {
  urls?: Url[];
};
const UrlGridContent: React.FC<UrlGridContentParams> = ({ urls }) => {
  if (!urls || urls.length === 0) {
    return null;
  }
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Labels
          labels={["URL", "Microsoft", "Google Chrome", "Mozilla Firefox"]}
        />
        {urls.map((url) => (
          <div
            key={url.id}
            className="grid grid-cols-1 gap-4 sm:col-span-4 sm:grid-cols-4"
          >
            <UrlItem url={url} />
          </div>
        ))}
      </div>
    </div>
  );
};

const UrlsForm = () => {
  const {
    url: {
      getAll: { refetch },
    },
  } = trpc.useContext();

  const addUrlMutation = trpc.url.addUrl.useMutation({
    onSuccess: (data) => {
      refetch();
      if (data.errors) {
        toast(
          `Some urls contained errors, ${data.inserted} URLs added successfully`,
          {
            icon: "⚠️",
            style: {
              background: "#202020",
              color: "#fff",
            },
          }
        );
      } else {
        toast.success(`${data.inserted} URLs added successfully`, {
          style: {
            background: "#202020",
            color: "#fff",
          },
        });
      }
    },
    onError: (data) => {
      console.log(data.data);
      toast.error(data.message, {
        style: {
          background: "#202020",
          color: "#fff",
        },
      });
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrlValidatorType>({
    resolver: zodResolver(urlValidator),
    mode: "onChange",
    defaultValues: {
      urlOrHost: null,
      urlsOrHosts: null,
    },
  });
  const onSubmit = (data: UrlValidatorType) => {
    console.log("data submitted", data);
    addUrlMutation.mutate(data);
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col justify-center gap-4 self-start lg:flex-row"
      >
        <div
          className={`${
            errors.urlOrHost?.message ? "tooltip tooltip-open" : ""
          } tooltip-error w-full`}
          data-tip={errors.urlOrHost?.message}
        >
          <input
            placeholder="Type URL"
            className="input w-full"
            {...register("urlOrHost")}
          />
        </div>
        <div
          className={`${
            errors.urlsOrHosts?.message ? "tooltip tooltip-open" : ""
          } tooltip-error`}
          data-tip={errors.urlsOrHosts?.message}
        >
          <label className="flex w-full cursor-pointer flex-col">
            <input
              type="file"
              className="order-2 max-w-[12rem] text-gray-400 file:hidden"
              accept="text/plain"
              {...register("urlsOrHosts")}
            />
            <div className="btn order-1 border-gray-700 hover:border-gray-700">
              Batch
            </div>
          </label>
        </div>
        <button
          type="submit"
          className={`btn border-gray-700 hover:border-gray-700 ${
            addUrlMutation.isLoading && "loading"
          }`}
        >
          Verify
        </button>
      </form>
    </>
  );
};

const Home: NextPage = () => {
  const urls = trpc.url.getAll.useQuery();
  const clearAllMutation = trpc.url.deleteAll.useMutation({
    onSuccess: (data) => {
      urls.refetch();
      toast.success(`${data.count} URLS deleted successfully`, {
        style: {
          background: "#202020",
          color: "#fff",
        },
      });
    },
    onError: (err) => {
      toast.error(err.message, {
        style: {
          background: "#202020",
          color: "#fff",
        },
      });
    },
  });
  return (
    <>
      <Head>
        <title>Trusts Certificates Verifier</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center gap-4 px-8">
        <h1 className="w-full py-8 text-4xl font-extrabold leading-normal lg:text-6xl">
          <p>Digital Certificates</p>
          <p>Trust Verifier</p>
        </h1>
        <UrlsForm />
        <UrlGridContent urls={urls.data} />
        <button
          className={`btn border-gray-700 hover:border-gray-700 ${
            clearAllMutation.isLoading && "loading"
          }`}
          onClick={() => clearAllMutation.mutate()}
        >
          Clear All
        </button>
        <TrustStoreInfo />
        <Toaster position="bottom-left" reverseOrder />
      </main>
    </>
  );
};

export default Home;

const TrustStoreInfo = () => {
  const router = useRouter();
  return (
    <div className="mt-auto flex w-full flex-col items-center justify-between p-4 sm:flex-row">
      <span
        className="badge badge-lg cursor-pointer"
        onClick={() => {
          router.push("/store/Mozilla Firefox");
        }}
      >
        Mozilla
      </span>
      <span
        className="badge badge-lg cursor-pointer"
        onClick={() => {
          router.push("/store/Microsoft Edge");
        }}
      >
        Microsoft
      </span>
      <span
        className="badge badge-lg cursor-pointer"
        onClick={() => {
          router.push("/store/Google Chrome");
        }}
      >
        Google
      </span>
    </div>
  );
};

const Labels = ({ labels }: { labels: string[] }) => (
  <>
    {labels.map((i) => (
      <div
        key={i}
        className="hidden items-center justify-center font-bold sm:flex"
      >
        <p className="truncate">{i}</p>
      </div>
    ))}
  </>
);
