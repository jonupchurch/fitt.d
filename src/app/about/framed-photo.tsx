import Image from "next/image";

/** White "mat" + thin frame border around the photo — the padding
 * between the image and the border is what reads as matting. */
export function FramedPhoto() {
  return (
    <div className="inline-block border-2 border-ink bg-white p-2">
      <Image
        src="/img/jonupchurchbiopicture.png"
        alt="Photo of Jon Upchurch, the builder of Fitt.d"
        width={1024}
        height={1536}
        sizes="150px"
        className="h-auto w-[150px] object-cover"
        priority
      />
    </div>
  );
}
