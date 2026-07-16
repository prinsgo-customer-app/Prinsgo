import apiClient from './apiClient';

export const searchPlaces = (input, lat, lng) =>
  apiClient
    .get('/places/search', { params: { input, lat, lng } })
    .then((r) => r.data.predictions);

export const getPlaceDetails = (placeId) =>
  apiClient.get('/places/details', { params: { placeId } }).then((r) => r.data);

export const reverseGeocode = (lat, lng) =>
  apiClient.get('/places/reverse-geocode', { params: { lat, lng } }).then((r) => r.data.address);
