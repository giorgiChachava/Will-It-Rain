import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  imag?: string;
}

const cities: City[] = [
  
  // Europe
  { name: 'London', country: 'United Kingdom', coordinates: [-0.1278, 51.5074], imag:"https://img.freepik.com/free-photo/big-ben-westminster-bridge-sunset-london-uk_268835-1395.jpg?semt=ais_hybrid&w=740&q=80" },

{ name: 'Kyiv', country: 'Ukraine', coordinates: [30.5245, 50.44504], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9KUertF4ZsdnKcn-tjgi2VRNcbBJyxh3K5w&s" },

{ name: 'Ankara', country: 'Turkey', coordinates: [32.8597, 39.9334], imag :"https://cdn-gaecj.nitrocdn.com/JMwuRIbFKRytZpZBQQGkRvqmTfGyKhHA/assets/images/optimized/rev-a7ce373/turkeytravelplanner.com/wp-content/uploads/2023/08/entrance-ankara-castle.jpg" },

{ name: 'Bern', country: 'Switzerland', coordinates: [7.4474, 46.9480], imag :"https://media.istockphoto.com/id/475439326/photo/bern.jpg?s=612x612&w=0&k=20&c=CMhqdUyCazMsEiDq9SdNIZDUCZQj_ODadTYmwRV-emk=" },

{ name: 'Belgrade', country: 'Serbia', coordinates: [20.4612, 44.8125], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQllZ0ZO1P-2qT569dXMnOmT3TixzX8AJPabA&s" },

{ name: 'Oslo', country: 'Norway', coordinates: [10.7522, 59.9139], imag :"https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/22/16/oslo.jpg" },

{ name: 'Skopje', country: 'North Macedonia', coordinates: [21.4254, 41.9981], imag :"https://i.guim.co.uk/img/media/8022a7b721b533e9429f33178494676cc35c8b67/0_675_6724_4033/master/6724.jpg?width=700&quality=85&auto=format&fit=max&s=953ad625bb2ff775f97f9696d9e9c479" },

{ name: 'Monaco', country: 'Monaco', coordinates: [7.4246, 43.7384], imag :"https://www.bacsport.co.uk/wp-content/uploads/2016/05/Monaco-1024x683.jpg" },


{ name: 'Chișinău', country: 'Moldova', coordinates: [28.8638, 47.0105], imag :"https://media-cdn.tripadvisor.com/media/photo-s/07/de/83/8c/hot-air-balloon-trip.jpg" },

{ name: 'Reykjavík', country: 'Iceland', coordinates: [-21.9408, 64.1470], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9SHWSGja8Nc7s34sCx-Wm8EQNf29DnO1vnw&s" },

{ name: 'Tbilisi', country: 'Georgia', coordinates: [44.8015, 41.6938], imag :"https://ik.imgkit.net/3vlqs5axxjf/TAW/ik-seo/uploadedImages/All_Destinations/AFME/Africa_-_Middle_East/Tbilisi_HERO/What-to-Do-in-Tbilisi-Georgia.jpg?tr=w-1008%2Ch-567%2Cfo-auto" },

{ name: 'Kutaisi', country: 'Georgia', coordinates: [42.6946, 42.2679], imag :"https://www.tripsavvy.com/thmb/q83iq9YC7lmaGvflAhTHuR8ejIQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/beautiful-aerial-view-of-bagrati-cathedral-in-kutaisi-city-in-georgia--1188643337-8638e92398e84326a385d921d66f984d.jpg" },

{ name: 'Batumi', country: 'Georgia', coordinates: [41.6367, 41.6168], imag :"https://www.georgianholidays.com/storage/pMxX1RAQ0HNnOGYxQRdyl6ygr3qulzOxlpJMgCIt.jpg" },

{ name: 'Zugdidi', country: 'Georgia', coordinates: [41.8709, 42.5088], imag :"https://www.advantour.com/img/georgia/images/zugdidi.jpg" },

{ name: 'Gori', country: 'Georgia', coordinates: [44.1158, 41.9842], imag :"https://storage.georgia.travel/images/gori-gnta.webp" },

{ name: 'Baku', country: 'Azerbaijan', coordinates: [49.8671, 40.4093], imag :"https://imageio.forbes.com/specials-images/imageserve/681a0ef4bdcc796c91f9ce32/City-Skyline-At-Night--Baku--Azerbaijan--South-Caucasus--Eurasia/0x0.jpg?height=473&width=711&fit=bounds" },

{ name: 'Yerevan', country: 'Armenia', coordinates: [55.5152, 40.1872], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRg0Opua4MiSDAnM-Ojsu8dRIjPo056un7GQ&s" },

{ name: 'Tirana', country: 'Albania', coordinates: [19.8187, 41.3275], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs29bk71vgYouFWPZzQF3Pbs6K8iOVLOCPHg&s" },

{ name: 'Barcelona', country: 'Spain', coordinates: [2.1686, 41.3874], imag :"https://static.independent.co.uk/2024/11/27/16/iStock-875273240.jpg?width=1200&height=630&fit=crop" },

{ name: 'Milan', country: 'Italy', coordinates: [9.1824, 45.4685], imag :"https://assets.enuygun.com/media/lib/570x400/uploads/image/milan-55252.jpeg" },

{ name: 'Munich', country: 'Germany', coordinates: [11.5820, 48.1351], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc5zWzaeCTkk0jGnh-ROHIU1vUlViiSr4JZA&s" },

{ name: 'Hamburg', country: 'Germany', coordinates: [9.9872, 53.5488], imag :"https://media.istockphoto.com/id/532269566/photo/hamburg.jpg?s=612x612&w=0&k=20&c=REYxXsCwKONyRYNOqHgNCFdmPoPvJVn4FKhLeNE-BGs=" },

{ name: 'Lyon', country: 'France', coordinates: [4.8357, 45.7640], imag :"https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/12/12/15/lyon-overview.jpg?width=1200" },

{ name: 'Edinburgh', country: 'United Kingdom', coordinates: [-3.1883, 55.9533], imag :"https://res.cloudinary.com/odysseytraveller/image/fetch/f_auto,q_auto,dpr_auto,r_4,w_1520,h_700,c_fill/https://cdn.odysseytraveller.com/app/uploads/2018/08/Edinburgh.jpg" },

{ name: 'Vienna', country: 'Austria', coordinates: [16.3713, 48.2081], imag :"https://www.shutterstock.com/image-photo/beautiful-aerial-panoramic-view-autumn-600nw-1450254959.jpg" },

{ name: 'Brussels', country: 'Belgium', coordinates: [4.3802, 50.8260], imag :"https://img.freepik.com/premium-photo/brussels-sunset-brussels-belgium_218319-8249.jpg" },

{ name: 'Sofia', country: 'Bulgaria', coordinates: [23.3219, 42.6977], imag :"https://media.istockphoto.com/id/615112296/photo/sofia-in-orange.jpg?s=612x612&w=0&k=20&c=9TRmdISuA9psiXjMRJqtwuusm32fxJvRqQFT8fwjseg=" },

{ name: 'Zagreb', country: 'Croatia', coordinates: [23.3219, 42.6977], imag :"https://media.istockphoto.com/id/615112296/photo/sofia-in-orange.jpg?s=612x612&w=0&k=20&c=9TRmdISuA9psiXjMRJqtwuusm32fxJvRqQFT8fwjseg=" },

{ name: 'Nicosia', country: 'Cyprus', coordinates: [33.3823, 35.3823], imag :"https://media.istockphoto.com/id/1195524554/photo/beautiful-aerial-view-over-old-town-of-nicosia-northern-cyprus-and-selimiye-mosque-in-cyprus.jpg?s=612x612&w=0&k=20&c=ug6yssEQ0CKW2XF4EuWT3dfO6E9p1x0taej1WWH0YxA=" },

{ name: 'Prague', country: 'Czech Republic', coordinates: [14.4378, 50.0755], imag :"https://media.istockphoto.com/id/1479817683/photo/prague-castle-with-st-vitus-cathedral-over-lesser-town-at-sunset-czech-republic.jpg?s=612x612&w=0&k=20&c=uOxC8wTORyQhisR2YX341sfGQj7Q8o9sWkBcsCzD674=" },

{ name: 'Copenhagen', country: 'Denmark', coordinates: [12.5683, 55.6761], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-n4baqZXUm_i_M9jO149uH7s687QquWIAKw&s" },

{ name: 'Tallinn', country: 'Estonia', coordinates: [24.7536, 59.4370], imag :"https://thumbs.dreamstime.com/b/tallinn-estonia-scenic-summer-view-old-town-sea-port-harbor-58746417.jpg" },

{ name: 'Helsinki', country: 'Finland', coordinates: [25.7482, 61.9241], imag :"https://media.istockphoto.com/id/183996236/photo/helsinki-finland.jpg?s=612x612&w=0&k=20&c=7fZ7yf8u-tuzy3zOvlm_Sv8AA_ZI8ZQDBsIQgKtvoN4=" },

{ name: 'Paris', country: 'France', coordinates: [2.3514, 48.8575], imag :"https://media.istockphoto.com/id/1345426734/photo/eiffel-tower-paris-river-seine-sunset-twilight-france.jpg?s=612x612&w=0&k=20&c=I5rAH5d_-Yyag8F0CKzk9vzMr_1rgkAASGTE11YMh9A=" },

{ name: 'Berlin', country: 'Germany', coordinates: [13.4050, 52.5200], imag :"https://media.istockphoto.com/id/486585530/photo/berlin-skyline-with-spree-river-at-sunset-germany.jpg?s=612x612&w=0&k=20&c=COfGf3zm3CDWUUKv8Kowew73ie5wGr8DfJ0gd88EafQ=" },

{ name: 'Athens', country: 'Greece', coordinates: [23.7275, 37.9838], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGtKtymwZqBhgo7lFKJZKW-7YFH9yTsL1GFwUa2auJ33NI60247BVHK2CbwFTFJk_q0s0&usqp=CAU" },

{ name: 'Budapest', country: 'Hungary', coordinates: [19.0402, 47.4979], imag :"https://media.istockphoto.com/id/1142247129/photo/landmarks-in-budapest.jpg?s=612x612&w=0&k=20&c=4JYFzudsd-haV0zAWFUbhlv0p6N0J81UHUUqXEMbNNE=" },


{ name: 'Dublin', country: 'Ireland', coordinates: [-6.2603, 53.3498], imag :"https://www.shutterstock.com/image-photo/dublin-ireland-night-view-famous-600nw-1116656705.jpg" },



{ name: 'Rome', country: 'Italy', coordinates: [12.4822, 41.8967], imag :"https://thumbs.dreamstime.com/b/rome-italy-colosseum-coliseum-sunrise-144201572.jpg" },




{ name: 'Riga', country: 'Latvia', coordinates: [24.1056, 59.9677], imag :"https://gte-gcms.images.tshiftcdn.com/resize=width:2048,fit:max/WtHSuLR9T2eNeETfaRTw?w=360&h=220&q=65&dpr=2&auto=format&fit=crop" },




{ name: 'Vilnius', country: 'Lithuania', coordinates: [25.2797, 54.6872], imag :"https://cdn.britannica.com/26/143426-050-A3F11FE1/town-section-Vilnius-Lithuania.jpg" },




{ name: 'Luxembourg City', country: 'Luxembourg', coordinates: [6.1296, 49.8153], imag :"https://media.istockphoto.com/id/1178040199/photo/luxembourg-city-luxembourg.jpg?s=612x612&w=0&k=20&c=Nkp2opvfv0wAmZh1k7fxaNsobfqdcgQvHCqEfUffji0=" },


{ name: 'Valletta', country: 'Malta', coordinates: [14.5141, 35.8992], imag :"https://e1.pxfuel.com/desktop-wallpaper/575/134/desktop-wallpaper-and-laptop-screen-of-valletta-malta-valletta.jpg" },



{ name: 'Amsterdam', country: 'Netherlands', coordinates: [4.9041, 52.3676], imag :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6D1bp3IsMB7TBXRcfZbt0vhLo9ylki-6wpQ&s" },


{ name: 'Warsaw', country: 'Poland', coordinates: [21.0122, 52.2297], imag :"https://t4.ftcdn.net/jpg/02/08/63/27/360_F_208632747_k54pqSxIwMblIc7HlZjrtlEBfWwjPR4z.jpg" },



{ name: 'Lisbon', country: 'Portugal', coordinates: [-9.1393, 38.7223], imag :"https://w0.peakpx.com/wallpaper/160/688/HD-wallpaper-lisbon-portugal-at-sunset-cityscapes-sky-clouds-sunsets-nature.jpg" },


{ name: 'Bucharest', country: 'Romania', coordinates: [26.1025, 44.4268], imag :"https://wallpapercat.com/w/full/5/6/1/1552846-2200x1352-desktop-hd-bucharest-wallpaper-image.jpg" },


{ name: 'Bratislava', country: 'Slovakia', coordinates: [17.1072, 48.1478], imag :"https://media.istockphoto.com/id/475905767/photo/bratislava-slovakia.jpg?s=612x612&w=0&k=20&c=3Tr3Oegx5CSKqnG7Qoz1abxsesDKgZ1wy0B3NYwvjvM=" },


{ name: 'Ljubljana', country: 'Slovenia', coordinates: [14.5058, 46.0569], imag :"https://t4.ftcdn.net/jpg/02/62/85/33/360_F_262853364_WBOFJflFYD1hotaI8VOJZlJRcq6vpTAC.jpg" },


{ name: 'Madrid', country: 'Spain', coordinates: [-3.7033, 40.4167], imag :"https://media.istockphoto.com/id/514769480/photo/madrid-spain-on-gran-via.jpg?s=612x612&w=0&k=20&c=5PDxqwnxYmudMHIs3ZkRJRE64153nnw-hJTH2zdryzc=" },


{ name: 'Stockholm', country: 'Sweden', coordinates: [18.0656, 59.3327], imag :"https://hips.hearstapps.com/hmg-prod/images/old-town-in-stockholm-sweden-royalty-free-image-506175664-1540478210.jpg" },

{ name: 'Atlanta', country: 'United States', coordinates: [-84.3885, 33.7501], imag :"https://i.pinimg.com/736x/86/0c/0b/860c0b3ccdde12db711cf9826211846f.jpg"},
{ name: 'Chicago', country: 'United States', coordinates: [-87.6324, 41.8832],imag : "https://i.pinimg.com/736x/d7/33/11/d733111fc3366c1a1cf3b5a7cc7e5369.jpg"},
{ name: 'New York', country: 'United States', coordinates: [-74.0060, 40.7128],imag : "https://i.pinimg.com/1200x/e6/07/ec/e607ecdbebfd3c3ea45d853339df5023.jpg"},
{ name: 'Las Vegas', country: 'United States', coordinates: [-115.1391, 36.1716],imag : "https://i.pinimg.com/1200x/ba/6b/b5/ba6bb50133d6898094da34034f3f1e39.jpg"},
{ name: 'Washington', country: 'United States', coordinates: [-120.7401, 47.7511],imag : "https://i.pinimg.com/736x/2c/37/36/2c37364c46c8e350300c1da07d83cbcc.jpg"},
{ name: 'Montana', country: 'United States', coordinates: [-110.3626, 46.8797],imag : "https://i.pinimg.com/1200x/41/a1/90/41a190ddc7a79383230ae1d0fd41b5a2.jpg"},
{ name: 'Minnesota', country: 'United States', coordinates: [-94.6859, 46.7296],imag : "https://i.pinimg.com/1200x/b1/db/4e/b1db4eb2555d82adfc5f01a2e9d17185.jpg"},
{ name: 'Idaho', country: 'United States', coordinates: [-114.7420, 44.0682],imag : "https://i.pinimg.com/1200x/d3/dc/56/d3dc5692221f1b1ea687195deaf07bdf.jpg"},
{ name: 'Oregon', country: 'United States', coordinates: [-120.5542, 43.8041],imag : "https://i.pinimg.com/736x/5a/53/44/5a5344660a710771b27711e9465ee22d.jpg"},
{ name: 'St Louis', country: 'United States', coordinates: [-90.1982, 38.6274],imag : "https://i.pinimg.com/1200x/bf/49/74/bf4974e5c159ec3767b1cfb791205227.jpg"},
{ name: 'Louisiana', country: 'United States', coordinates: [-91.5209, 30.5191],imag : "https://i.pinimg.com/1200x/81/1b/84/811b8411b455ae8fe9ffe0713cb7dabf.jpg"},
{ name: 'Oklahoma ', country: 'United States', coordinates: [-97.0929, 35.0078],imag : "https://i.pinimg.com/1200x/f4/a1/9a/f4a19a40d4a770b642ab508cfb06b5bb.jpg"},
{ name: 'Georgia', country: 'United States', coordinates: [-82.9071, 32.1574],imag : "https://i.pinimg.com/1200x/05/86/32/058632506d11c93282edc045551d176a.jpg"},
{ name: 'San Antionio', country: 'United States', coordinates: [-98.4946, 29.4252],imag : "https://i.pinimg.com/1200x/02/39/98/02399818831ac3dd6c9fcf6e2e3c82b9.jpg"},
{ name: 'Michigan', country: 'United States', coordinates: [- 85.6024, 44.3148],imag : "https://i.pinimg.com/736x/92/3d/ce/923dce09d9d6ffa5fe57f4e4d55917fe.jpg"},
{ name: 'Virginia', country: 'United States', coordinates: [-78.6569, 37.4316],imag : "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTSUMj8YmzdAeMrr2Xw_tLU9pj-Iwx98ilIMw9yPrXrsv6cs01gCaBaEmgBhJghBamuGihBJj7T2lfVzhjCcsTgBSGcSA0Uac9Egbspsw"},
{ name: 'Indiana', country: 'United States', coordinates: [-85.6024, 40.5512],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRpLMdl4vtpQNvYP15jeXIN42_F5jQMO1YLWElKh5KjTh4ug-yiQhjppbuGFNj3uWAYR9WjllUaJrfbzazAvvycZPzN7B7z0RIKPRsSuQ"},
{ name: 'Colorado', country: 'United States', coordinates: [-105.7821, 39.5501],imag : "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqhRpuVULzC6JJM-RL_AQwN4Ilqgh1uqbQmMmRcclDtc-z8K0Z6dMLLJ0xQile1r-subwgC_h0ckRfhODdMwcy9G5MIIonhBcJQLFQF30gJdlGNGNIRIxm6aphYqCLgVsMicgQ7=w743-h429-n-k-no"},
{ name: 'Wyoming', country: 'United States', coordinates: [-107.2903, 43.0760],imag : "https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_3840,h_1920,g_auto/dpr_auto/f_auto/q_auto:eco/v1/gettyimages-540063269?_a=BAVAZGID0"},
{ name: 'California', country: 'United States', coordinates: [-119.4179, 36.7783],imag : "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr9PsyIdKYZzuj2O4A6NReLqScM6Afizg1yapV2mH6fth55KEoQn8PNewMqeg_E5p22vb2aJA8_UMrqGtWt2gBpPm4MmKxgB_IucwqLQbeD-oyTZLj0MYr0rlKOw0WCiRlroUlpKQ=w745-h431-n-k-no"},
{ name: 'Florida', country: 'United States', coordinates: [-81.5158, 27.6648],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQgRJ3xdpW41enMVu66WSOeZDbtWs8VKZvGkM_wgHuHYmEdo3ibCbpO0m-U-jPmpemw6H_eCYBPyIVE6qkHpo6cTp-EPKnvUaxeNQOZOw"},

{ name: 'Lima', country: 'Peru', coordinates: [-77.0431, -12.0467],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSjbXMWUd3KSSfmSLaKrOiTDLUgKkjrXl5kIfqL71No7_s9gjpXIBQ6TeevhpZeLMwMHRdEBLrbEDyyFiu_udaUjqhgaQHe_Q4YqKzluCA"},
{ name: 'Bogota', country: 'Colombia', coordinates: [-74.0721, 4.7110],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQ4ZAQ8x7G7dIkqEdGPj5dnAQ7m2fBn41B66j8SfsbJQkHef8eEH2QUgK3MT-biWJPmc8RTP4NBshUXlHNpVa1ZaZKN2l5aU3FWEH_VYQ"},
{ name: 'Caracas', country: 'Venezuela', coordinates: [-66.9036, 10.4806],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTOPDc2RtlllkIy1RVI8CC4fIhB2ayIl9ZPv3J8RIqXHX7jtATchUFV1IarBD2r86KbQS64dlcQVoPN2QuT52BeGUxzPV1FPIEd9RR9cRU"},
{ name: 'Santa Cruz de la Sierra', country: 'Bolivia', coordinates: [-63.1925, -17.7981],imag : "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npqZCmiQXCEVRPDRGmCQ7d_iWwLPoE0jxKmnv-6PZpcGu1bdcCydj2PMad8X-2O0VNAFsrUiN6wURGl9qvcr8KlVXWafE3RBEia5Zf3aLsYUP2Ttxgei2WPhkFf0CGz-dQ8BkA=w743-h429-n-k-no"},
{ name: 'Santiago', country: 'Chile', coordinates: [-70.6693, -33.4489],imag : "https://blog.tours4fun.com/wp-content/uploads/2016/04/santiago-1000x600.jpg"},
{ name: 'Buenos Aires', country: 'Argentina', coordinates: [-58.3821, -34.6037],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcS0do7UPQ31Mvc1q5euhKXhgNF3wlSuyFjQeH-x3cFGtr_cvGu85rjYeBHHEAoc1Xx-KcuO4YNnZwpFovDUxnH_th-A3WKL_DLIejNK7Q"},
{ name: 'Montevideo', country: 'Uruguay', coordinates: [-56.1851, -34.9055],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcR9c9CQtRrzkTGZHYxiBWGH738DS-q_9FD1X9J1zwVcWna4m_LtvdM3wmRZTBtkZTSYGvmE2RLTWWTnqtBXHRlHQdi2LxiA4jOUWwu6Bg"},
{ name: 'Asunción', country: 'Paraguay', coordinates: [-57.5759, -25.2637],imag : "https://t0.gstatic.com/licensed-image?q=tbn:ANd9GcQNKG7xEJXZOUG5AQnAcurI_q9gCzHq9JGnXPubMupYGPUeNiBZoiHdneDi9onWR4xR"},
{ name: 'Brasília', country: 'Brazil', coordinates: [-47.8919, -15.7975],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTeQyVoNR7ISJfhYCn5KzxNwllNBZpl3OAhg791wWORWdZYK-O6rG2ZQ2nkmCAN6ooMcfISBWwLlGhKk8XeICuBiZsbxS_Ho5PfY5Ky-w"},
{ name: 'Manaus', country: 'Brazil', coordinates: [-60.0217, -3.1190],imag : "https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRpVjBgLYXoNHGUU93tqz_-7QyGKvjIRFyQ3QL7_AvgaV0KqqqJ3rJzcemSfgjragb3yZmPPiN0ubPRXdRDauPTzfB4GlElzZiwEa7_Pg"},

{ name: 'Tunis', country: 'Tunisia', coordinates: [10.1815, 36.8065],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSlIPm7ygeDG7M54hLVihsn3815HPyNxD9I1Ak47q7OQkuz-ks222owTt1L58Xqf2-04uwebfwROTNGWHbVsWry2jkqi7SKBu3tkL5wHA	"},
{ name: 'Rabat', country: 'Morocco', coordinates: [-6.8539, 34.0084],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSTL84txe2OzbCDUoDR3P8fSHcUDFqxNyEgT-_uIievBDhIC7zdE1nIzfe-SjP2Yu8QS604zbrqcz5HEWLzznw61bphwfb38fzN7SVZ6A"},
{ name: 'Algiers', country: 'Algeria', coordinates: [3.0588, 36.7538],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcRzCm3Afozj1fYULJbFBOFWa1M-fziOnfD2nalVXsP4w7JTYMxNpyQql_4Ym061eTLWy8etgPbMcoMxk9KOhMnWPGbfwsChwQEkwPLCKIc"},
{ name: 'Tripoli', country: 'Libya', coordinates: [13.1872, 32.8877],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcThQQsMXupqIsn13hGqGBuWeToILb-nR9XQHHyw4aWFYXz7m-I7XpMzjgG4iLmXD7fY74K0LT_BQyBQiX32T_TyfNjxMnYBrcBU5KmWZGc"},
{ name: 'Cairo', country: 'Egypt', coordinates: [31.2357, 30.0444],imag : "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQyojOS9DEK7Htdw3g_Ox4roMFt9k-i3PYGg8yE8fEFC63LO2V7pXxBrOu3ADbN3fe3d6aJnKsQ5xqrsQEe75xMX-RR4K1AJloX40xqZg"},
{ name: 'Damascus', country: 'Syria', coordinates: [36.2768, 33.5132],imag : "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQg0yFr0uwmTdrm7DCGViEpuYA2CG3abfz8NoARz8BuvJB50NHueq2HqlmfOwidlMCdaBHFqNKK2SbTihfpyG2m4P8M5gXSKrT08ZXbDQ"},
{ name: 'Baghdad', country: 'Iraq', coordinates: [44.3661, 33.3152],imag : "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQ7Qv-1LjQywYE71UlIB2ieKL-cgup-O7btKfkX7w9AKZ66r0zteo35BzozA61C6J5SQOXqMo9mrGwGgkHOuoh-cumM-I69d_9iXcvKDg"},
{ name: 'Riyadh', country: 'Saudi Arabia', coordinates: [46.6753, 24.7136],imag : "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcS2R9alK6xU8A6-6dM1RMhRiUCiGYK94m9aVNTAgoNoa6J55mSrwEaU5IhVoKbi2fvFV-J1s8v5Ky7uc0FtY6fyIqvuOicjze0njQl3vw"},
{ name: 'Tehran', country: 'Iran', coordinates: [51.3347, 35.7219],imag : "https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcR3nJs_E2pESIbTIjKM_5mstxrjw-Fn3EsAfdIQUtXjFcvVsNJgKx2O5AUXTwRdDl0gq8edZjYmzuhxoSQU8HTzJYLrKc_MFs-lvHj82g"},
{ name: 'Beijing', country: 'China', coordinates: [116.4074, 39.9042],imag : "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQVpfCj5TuwfTU3Gprwme15fuzZsIx6T5SiNrys1E0oNx-UHUWSdc0p8qMHG1vUPrV8TwypiN3zHuwtVMyHJuPooRuoyf8UxdNfuExyTw"},
{ name: 'Chongqing', country: 'China', coordinates: [106.5512, 29.5657],imag : "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npCtW7j3efl87R6vETA5jSPgWGK8lT8XR_kUxV_tcH1Letafqh2PVf_ARxNM0adPA1PwImYmfmgg0AYd23NoM_N11cpQD4aTFh2DK8R54uEw5GxkOX29Hw20qRyb9_bpMTJDsw=w743-h429-n-k-no"},
{ name: 'Tokyo', country: 'Japan', coordinates: [139.6500, 35.6764],imag : "https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQSeQok9eSVeTBJ5AuomGj38ZtfGMCM97kVur97U38I2qfFJdfKBUmrYd21UH1gkKA6d9azlekMNux3PrTVP9OnJ8kZvvjKE6_WuK59xA"},



  
];

interface WeatherMapProps {
  onCitySelect: (city: City) => void;
  apiKey: string;
}

const WeatherMap = ({ onCitySelect, apiKey }: WeatherMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    mapboxgl.accessToken = apiKey;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      zoom: 2,
      center: [15, 30],
      pitch: 0,
    });


    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    const ZOOM_THRESHOLD = 5;

    map.current.on('load', () => {
    cities.forEach((city) => {
        const el = document.createElement('div');
        el.className = 'city-marker';
        el.style.display = 'none'; // Hidden by default
        el.innerHTML = `
          <div class="flex flex-col items-center cursor-pointer group">
            <div class="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span class="text-xs font-medium mt-1 bg-card px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              ${city.name}
            </span>
          </div>
        `;

        el.addEventListener('click', () => {
          onCitySelect(city);
          map.current?.flyTo({
            center: city.coordinates,
            zoom: 10,
            duration: 1500,
          });
          toast.success(`Viewing ${city.name}, ${city.country}`);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(city.coordinates)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Update marker visibility based on zoom level
      const updateMarkerVisibility = () => {
        const zoom = map.current?.getZoom() || 0;
        markersRef.current.forEach(marker => {
          const el = marker.getElement();
          if (zoom >= ZOOM_THRESHOLD) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        });
      };

      // Listen to zoom changes
      map.current?.on('zoom', updateMarkerVisibility);
      
      // Initial check
      updateMarkerVisibility();
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [apiKey, onCitySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {!apiKey && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4 p-6">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
