'use client'
import { useState } from "react";
import Image from "next/image";
import {cn} from "@/lib/utils"
const ProductImages = ({images: allImages}:{images:readonly string[]}) => {
    const images = allImages.filter(Boolean);
    const [current,setCurrent]=useState(0);
    if (images.length === 0) return null;
    return ( <>
        <div className="space-y-4">
            <Image src={images[current] ?? images[0]} alt='product images' width={1000} height={1000} className="min-h-75 object-cover object-center"/>
            <div className="flex">
                {images.map((image,index)=>(
                    <div key={image} onClick={()=>setCurrent(index)}
                    className={cn('border mr-2 cursor-pointer hover:border-orange-600' , current === index && 'border-orange-600')}>
                        <Image src={image} alt="image" width={100} height={100}/>
                    </div>
                ))}
            </div>
        </div>
    </> );
}
 
export default ProductImages;