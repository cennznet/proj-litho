import React from "react";
import Link from "next/link";

import Text from "../components/Text";
import Modal from "../components/Modal";
import DeviceContext from "../components/DeviceContext";
import NFT from "../components/nft";
import NFTRenderer from "../components/nft/NFTRenderer";

const FEATURED_COLLECTION_TITLE = process.env.NEXT_FEATURED_COLLECTION_TITLE;

// This function gets called at build time
export async function getStaticProps() {
  // Call an external API endpoint to get posts
  const res = await fetch(`${process.env.BASE_PATH}/api/getFeaturedListings`);
  let featuredData;
  try {
    featuredData = await res.json();
  } catch (e) {
    console.log("Err fetching feature listing:", e);
    featuredData = {};
  }

  // By returning { props: featuredData }, the Home component
  // will receive `featuredData` as a prop at build time
  return {
    props: featuredData,
  };
}

const Home: React.FC<{ featuredData }> = (featuredData: any) => {
  const [showViewOnDesktop, setShowViewOnDesktop] = React.useState(false);
  const deviceContext = React.useContext(DeviceContext);
  const data = featuredData;

  return (
    <>
      <div
        className={`bg-litho-mustard px-3 py-2 justify-center mb-4 item-start ${
          !deviceContext.isChrome || deviceContext.isMobile ? "flex" : "hidden"
        }`}
      >
        <img src="/info.svg" alt="" className="h-5 mr-2" />
        <Text variant="body2" className="flex-1">
          Open in Chrome on a desktop to mint your NFT
        </Text>
      </div>
      <div className="bg-litho-cream flex flex-col lg:flex-row h-full min-h-litho-body">
        <div
          className="px-6 py-8 mb-4 lg:mb-0 border-2 border-litho-black lg:w-1/3 lg:p-6 xl:p-10 lg:bg-home-1 bg-center bg-no-repeat flex items-center"
          style={{ backgroundSize: "auto 105%", backgroundPositionX: "90%" }}
        >
          <Text variant="h2" className="hidden lg:block">
            <span className="font-normal">Launch into the</span> Lithoverse.{" "}
            <span className="font-normal">Your place to</span> create and
            exchange NFTs.
          </Text>{" "}
          <Text variant="h4" className="lg:hidden">
            <span className="font-normal">Launch into the</span> Lithoverse.{" "}
            <span className="font-normal">Your place to</span> create and
            exchange NFTs.
          </Text>{" "}
        </div>
        <div className="w-full lg:w-1/3 border-2 border-litho-black flex flex-col mb-4 lg:mb-0 lg:mx-6 bg-home-2 items-center">
          <img
            src="/start-minting.png"
            className="object-center object-contain pt-16"
          />

          <div className="flex-1 p-6 pt-0 flex flex-col items-center justify-end w-full">
            <Text variant="h4" className="mb-5 bg-litho-cream p-2">
              CREATE NFTs
            </Text>
            {deviceContext.isMobile ||
            (!deviceContext.isChrome && !deviceContext.isFirefox) ? (
              <button
                className="bg-litho-blue w-40 h-12 flex items-center justify-center"
                onClick={() => setShowViewOnDesktop(true)}
              >
                <Text variant="button" color="white">
                  START MINTING
                </Text>
              </button>
            ) : (
              <Link href="/create">
                <a className="bg-litho-blue w-40 h-12 flex items-center justify-center flex">
                  <Text variant="button" color="white">
                    START MINTING
                  </Text>
                </a>
              </Link>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/3 flex flex-col border-2 border-litho-black">
          <img
            src="/marketplace.png"
            className="object-center object-cover h-4/5"
          />

          <div className="flex-1 p-6 pt-0 pb-3 flex flex-col items-center justify-end w-full mb-3">
            <Text variant="h4" className="mb-5 bg-litho-cream p-2">
              MARKETPLACE
            </Text>
            <Link href="/marketplace">
              <a className="bg-litho-blue w-40 h-12 flex items-center justify-center flex">
                <Text variant="button" color="white">
                  BROWSE NFTS
                </Text>
              </a>
            </Link>
          </div>
        </div>
        {/* <div className="w-full flex items-center justify-center mb-16">
          <div className="w-1/2 flex justify-center">
            <Image src="/placeholder.png" height={400} width={400} />
          </div>
          <div className="p-6 pb-10 flex flex-col w-1/2">
            <span className="text-3xl font-bold">Join the hype</span>
            <span className="h-12 text-xl leading-6 my-4">
              Subscribe to our exclusive mailing list and be the first to know
              when new NFTs drop.
            </span>
            <div className="h-14 w-full flex">
              <input
                className="h-full flex-1 border border-litho-black px-4"
                placeholder="Enter email here"
              />
              <button className="text-white bg-litho-blue px-4">Subscribe</button>
            </div>
          </div>
        </div> */}
        {showViewOnDesktop && (
          <Modal
            onClose={() => setShowViewOnDesktop(false)}
            disableOutsideClick={true}
            styles={{ modalBody: "w-11/12 lg:w-3/12", modalContainer: "z-20" }}
          >
            <Text variant="h4" color="litho-blue">
              Open in Chrome on a desktop to mint your NFT
            </Text>
          </Modal>
        )}
      </div>
      {data && data.featuredListings && data.featuredListings.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center mb-10">
            <Text variant="h2">Featured {FEATURED_COLLECTION_TITLE}</Text>
          </div>
          {
            <div className="grid grid-row lg:grid-cols-4 gap-5 grid-flow-4 auto-rows-fr mb-10">
              {data.featuredListings.map((nft) => {
                return (
                  <Link
                    href={`/nft/${nft.tokenId[0]}/${nft.tokenId[1]}/${nft.tokenId[2]}`}
                    key={nft.listingId}
                  >
                    <a>
                      <NFT
                        nft={{ ...nft, source: "featured" }}
                        renderer={NFTRenderer}
                      />
                    </a>
                  </Link>
                );
              })}
            </div>
          }
        </div>
      )}
    </>
  );
};

export default Home;