const mongoose = require("mongoose");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/snapnshop')
}
main().then(()=>{
    console.log('connection successfull')
}).catch((err)=>{
     console.log('DB err',err)
})
let Item = require("../model/index.js");

Item.insertMany([
  {
    i_img:'https://images-cdn.ubuy.co.in/64c6311f906c56375360e2c0-dove-nutritive-solutions-shampoo-and.jpg',
    i_name: "Daily Shine Shampoo",
    i_price: 85,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://assets.ajio.com/medias/sys_master/root/20231130/bQKq/6568759eddf7791519a78e39/-473Wx593H-4900592570-multi-MODEL.jpg',
    i_name: "Daily Shine Shampoo(650ml)",
    i_price: 809,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://cdn01.pharmeasy.in/dam/products_otc/N58321/dove-daily-shine-shampoo-650-ml-2-1740477445.jpg',
    i_name: "Hair Therapy(650ml)",
    i_price: 707,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://images-cdn.ubuy.co.in/661bf2c3d49c99192744e755-dove-shampoo-and-conditioner-set.jpg',
    i_name: "Dove Hair Fall Resuce Shampoo For Weak Hair,1 Ltr",
    i_price: 575,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://images.jdmagicbox.com/quickquotes/images_main/dove-shampoo-daily-shine-650-ml-250193430-juzvvv7h.jpg',
    i_name: "Dove Daily Shine Shampoo For Dull Hair,1 Ltr",
    i_price: 597,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://bazaar5.com/image/cache/catalog/pro/product/apiData/b07hb2l7qd-dove-intense-repair-shampoo-340ml-for-dry-frizzy-hair-with-fiber-actives-to-smoothen-and-strengthen-dry-frizzy-hair-deep-nourishment-to-damaged-hair-5-320x320.jpg',
    i_name: "Dove Intense Repair Shampoo For Dry & Damaged Hair, ! Ltr",
    i_price: 527,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://assets.unileversolutions.com/v1/81938562.jpg',
    i_name: "Hair Fall Rescue Shampoo(180ml)",
    i_price: 180,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://media6.ppl-media.com//tr:h-235,w-235,c-at_max,dpr-2,q-40/static/img/product/393643/dove-hair-fall-rescue-shampoo-650-ml-10-in-1-deep-repair-treatment-hair-mask-120-ml_3_display_1737121812_07646f7f.jpg',
    i_name: "Dandurff Clean & Fresh(180ml)",
    i_price: 166,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://m.media-amazon.com/images/I/51jn16cztmL.jpg',
    i_name: "Dove Hair Therapy Breakage Repair Sulphate-free Shampoo",
    i_price: 450,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://i.pinimg.com/736x/f2/7f/14/f27f1478938591e46bad4bf5821b9141.jpg',
    i_name: "Dove Glycoli + Hydration Shampoo(180ml)",
    i_price: 189,
    i_globle_name: "shampoo",
    i_brand_name: "dove",
  },
  {
    i_img:'https://m.media-amazon.com/images/I/51-lpxBJF+L.jpg',
    i_name: "johnson's Baby Gift Pack With Pouch",
    i_price: 520,
    i_globle_name: "baby gift pack",
    i_brand_name: "Johnson's Baby",
  },
  {
    i_img:'https://m.media-amazon.com/images/I/41q2sGiMnOL.jpg',
    i_name: "johnson's Baby No More Tears Baby Shampoo 200ml",
    i_price: 195,
    i_globle_name: "shampoo",
    i_brand_name: "Johnson's Baby",
  },
])
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log(e);
  });
