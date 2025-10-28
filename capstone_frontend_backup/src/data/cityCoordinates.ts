/**
 * Philippine City Coordinates Mapping
 * Maps city names to latitude/longitude coordinates for map visualization
 */

export const CITY_COORDINATES: Record<string, [number, number]> = {
  // NCR (National Capital Region / Metro Manila)
  'Manila': [14.5995, 120.9842],
  'Quezon City': [14.6760, 121.0437],
  'Caloocan': [14.6507, 120.9838],
  'Las Piñas': [14.4453, 120.9823],
  'Makati': [14.5547, 121.0244],
  'Malabon': [14.6708, 120.9573],
  'Mandaluyong': [14.5794, 121.0359],
  'Marikina': [14.6507, 121.1029],
  'Muntinlupa': [14.3811, 121.0437],
  'Navotas': [14.6671, 120.9405],
  'Parañaque': [14.4793, 121.0198],
  'Pasay': [14.5378, 120.9896],
  'Pasig': [14.5764, 121.0851],
  'Pateros': [14.5437, 121.0686],
  'San Juan': [14.6019, 121.0355],
  'Taguig': [14.5176, 121.0509],
  'Valenzuela': [14.7008, 120.9830],
  
  // Region I (Ilocos Region)
  'Laoag': [18.1969, 120.5937],
  'Batac': [18.0556, 120.5680],
  'Vigan': [17.5747, 120.3869],
  'Candon': [17.1931, 120.4453],
  'San Fernando (La Union)': [16.6166, 120.3172],
  'Alaminos': [16.1560, 119.9821],
  'Dagupan': [16.0429, 120.3336],
  'San Carlos (Pangasinan)': [15.9324, 120.3449],
  'Urdaneta': [15.9763, 120.5712],
  
  // Region II (Cagayan Valley)
  'Tuguegarao': [17.6132, 121.7270],
  'Ilagan': [17.1425, 121.8872],
  'Cauayan': [16.9276, 121.7705],
  'Santiago': [16.6881, 121.5468],
  
  // Region III (Central Luzon)
  'Balanga': [14.6774, 120.5364],
  'Malolos': [14.8433, 120.8114],
  'Meycauayan': [14.7343, 120.9558],
  'San Jose del Monte': [14.8139, 121.0453],
  'Cabanatuan': [15.4859, 120.9670],
  'Gapan': [15.3083, 120.9465],
  'Palayan': [15.5421, 121.0828],
  'San Jose (Nueva Ecija)': [15.7897, 120.9960],
  'Science City of Muñoz': [15.7130, 120.9039],
  'Balanga (Bataan)': [14.6774, 120.5364],
  'Angeles': [15.1450, 120.5887],
  'Mabalacat': [15.2244, 120.5700],
  'San Fernando (Pampanga)': [15.0288, 120.6897],
  'Olongapo': [14.8294, 120.2828],
  'Tarlac City': [15.4755, 120.5964],
  
  // Region IV-A (CALABARZON)
  'Batangas City': [13.7565, 121.0583],
  'Lipa': [13.9411, 121.1650],
  'Tanauan': [14.0859, 121.1500],
  'Cavite City': [14.4791, 120.8964],
  'Dasmariñas': [14.3294, 120.9366],
  'Imus': [14.4297, 120.9369],
  'Tagaytay': [14.1054, 120.9606],
  'Trece Martires': [14.2816, 120.8670],
  'Bacoor': [14.4593, 120.9421],
  'General Trias': [14.3857, 120.8808],
  'Lucena': [13.9372, 121.6174],
  'Tayabas': [14.0292, 121.5922],
  'Biñan': [14.3347, 121.0836],
  'Cabuyao': [14.2783, 121.1250],
  'Calamba': [14.2117, 121.1653],
  'San Pablo': [14.0682, 121.3255],
  'San Pedro': [14.3594, 121.0166],
  'Santa Rosa': [14.3124, 121.1114],
  'Antipolo': [14.5860, 121.1756],
  
  // Region IV-B (MIMAROPA)
  'Puerto Princesa': [9.7392, 118.7353],
  'Calapan': [13.4116, 121.1803],
  
  // Region V (Bicol Region)
  'Legazpi': [13.1391, 123.7436],
  'Ligao': [13.2203, 123.5304],
  'Tabaco': [13.3594, 123.7341],
  'Naga': [13.6192, 123.1814],
  'Iriga': [13.4280, 123.4121],
  'Masbate City': [12.3685, 123.6167],
  'Sorsogon City': [12.9740, 124.0055],
  
  // Region VI (Western Visayas)
  'Iloilo City': [10.7202, 122.5621],
  'Passi': [11.1076, 122.6417],
  'Bacolod': [10.6770, 122.9506],
  'Bago': [10.5371, 122.8369],
  'Cadiz': [10.9519, 123.2925],
  'Escalante': [10.8401, 123.4971],
  'Himamaylan': [10.1015, 122.8708],
  'Kabankalan': [9.9887, 122.8144],
  'La Carlota': [10.4216, 122.9217],
  'Sagay': [10.8975, 123.4253],
  'San Carlos (Negros Occidental)': [10.4818, 123.4189],
  'Silay': [10.7971, 123.0001],
  'Sipalay': [9.7525, 122.4035],
  'Talisay (Negros Occidental)': [10.7418, 122.9750],
  'Victorias': [10.9007, 123.0766],
  'Roxas': [11.5851, 122.7510],
  
  // Region VII (Central Visayas)
  'Cebu City': [10.3157, 123.8854],
  'Bogo': [11.0518, 124.0061],
  'Carcar': [10.1074, 123.6393],
  'Danao': [10.5196, 124.0260],
  'Lapu-Lapu': [10.3103, 123.9494],
  'Mandaue': [10.3237, 123.9224],
  'Naga (Cebu)': [10.2082, 123.7587],
  'Talisay (Cebu)': [10.2451, 123.8492],
  'Toledo': [10.3778, 123.6386],
  'Bais': [9.5903, 123.1214],
  'Bayawan': [9.3692, 122.8046],
  'Canlaon': [10.3815, 123.2008],
  'Dumaguete': [9.3068, 123.3054],
  'Guihulngan': [10.1208, 123.2805],
  'Tanjay': [9.5158, 123.1547],
  'Tagbilaran': [9.6473, 123.8534],
  
  // Region VIII (Eastern Visayas)
  'Tacloban': [11.2444, 125.0039],
  'Baybay': [10.6794, 124.8003],
  'Ormoc': [11.0059, 124.6074],
  'Maasin': [10.1301, 124.8408],
  'Borongan': [11.6053, 125.4328],
  'Calbayog': [12.0664, 124.6035],
  'Catbalogan': [11.7752, 124.8863],
  
  // Region IX (Zamboanga Peninsula)
  'Zamboanga City': [6.9214, 122.0790],
  'Dapitan': [8.6570, 123.4231],
  'Dipolog': [8.5835, 123.3408],
  'Isabela (Basilan)': [6.7014, 121.9714],
  'Pagadian': [7.8252, 123.4354],
  
  // Region X (Northern Mindanao)
  'Cagayan de Oro': [8.4542, 124.6319],
  'El Salvador': [8.5350, 124.5176],
  'Gingoog': [8.8267, 125.1003],
  'Malaybalay': [8.1539, 125.1275],
  'Valencia': [7.9064, 125.0941],
  'Iligan': [8.2280, 124.2452],
  'Oroquieta': [8.4859, 123.8049],
  'Ozamiz': [8.1482, 123.8417],
  'Tangub': [8.0666, 123.7486],
  
  // Region XI (Davao Region)
  'Davao City': [7.1907, 125.4553],
  'Island Garden City of Samal': [7.0731, 125.7083],
  'Panabo': [7.3084, 125.6836],
  'Tagum': [7.4479, 125.8078],
  'Digos': [6.7497, 125.3572],
  'Mati': [6.9549, 126.2155],
  
  // Region XII (SOCCSKSARGEN)
  'General Santos': [6.1164, 125.1716],
  'Koronadal': [6.5008, 124.8469],
  'Tacurong': [6.6886, 124.6774],
  'Kidapawan': [7.0103, 125.0895],
  
  // Region XIII (Caraga)
  'Butuan': [8.9475, 125.5406],
  'Cabadbaran': [9.1239, 125.5344],
  'Bayugan': [8.7145, 125.7453],
  'Bislig': [8.2159, 126.3218],
  'Tandag': [9.0785, 126.1987],
  'Surigao City': [9.7869, 125.4914],
  
  // CAR (Cordillera Administrative Region)
  'Baguio': [16.4023, 120.5960],
  'Tabuk': [17.4189, 121.4443],
  
  // BARMM (Bangsamoro Autonomous Region)
  'Cotabato City': [7.2232, 124.2450],
  'Lamitan': [6.6500, 122.1333],
  'Marawi': [7.9986, 124.2928],
};

/**
 * Get coordinates for a city
 * @param city City name
 * @returns [latitude, longitude] or null if not found
 */
export function getCityCoordinates(city: string): [number, number] | null {
  return CITY_COORDINATES[city] || null;
}

/**
 * Get all available cities
 * @returns Array of city names
 */
export function getAvailableCities(): string[] {
  return Object.keys(CITY_COORDINATES).sort();
}

/**
 * Check if a city has coordinates
 * @param city City name
 * @returns true if coordinates exist
 */
export function hasCityCoordinates(city: string): boolean {
  return city in CITY_COORDINATES;
}
