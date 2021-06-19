import { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

namespace ArtistResponseData {

    export interface RootObject {
        id: number;
        name: string;
        link: string;
        share: string;
        picture: string;
        picture_small: string;
        picture_medium: string;
        picture_big: string;
        picture_xl: string;
        nb_album: number;
        nb_fan: number;
        radio: boolean;
        tracklist: string;
        type: string;
    }

}



namespace SearchResponseData {

    export interface Artist {
        id: number;
        name: string;
        link: string;
        picture: string;
        picture_small: string;
        picture_medium: string;
        picture_big: string;
        picture_xl: string;
        tracklist: string;
        type: string;
    }

    export interface Album {
        id: number;
        title: string;
        cover: string;
        cover_small: string;
        cover_medium: string;
        cover_big: string;
        cover_xl: string;
        md5_image: string;
        tracklist: string;
        type: string;
    }

    export interface Datum {
        id: number;
        readable: boolean;
        title: string;
        title_short: string;
        title_version: string;
        link: string;
        duration: number;
        rank: number;
        explicit_lyrics: boolean;
        explicit_content_lyrics: number;
        explicit_content_cover: number;
        preview: string;
        md5_image: string;
        artist: Artist;
        album: Album;
        type: string;
    }

    export interface RootObject {
        data: Datum[];
        total: number;
        next: string;
    }

}

interface QuestHTTPResponse {
    error: boolean | string,
    data: any
}

export default async (request: VercelRequest, response: VercelResponse) => {
    const { q = 'World' } = request.query

    if (q) {

        try {
            const { data }: AxiosResponse<SearchResponseData.RootObject> = await axios.get(`https://api.deezer.com/search?q=${q}`);

            const { data: data_ }: AxiosResponse<ArtistResponseData.RootObject> = await axios.get(`https://api.deezer.com/artist/${data.data[0].artist.id}`)
            response.status(200).json(data_);

        } catch (error) {

            response.status(500).json({} as QuestHTTPResponse);

        }


    } else {
        response.status(400).json()
    }

}