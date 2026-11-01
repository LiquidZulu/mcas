import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
    RectProps,
    Ray,
    Txt,
    Path,
    Circle,
    Fragment,
} from '@motion-canvas/2d';
import {
    SignalValue,
    SimpleSignal,
    createRef,
    createSignal,
} from '@motion-canvas/core';
import { a, mkSignal, SIround, unitsSocialMedia } from '../util';
import youtubeLogo from '../assets/social-icons/youtube-logo.png';
import search from '../assets/social-icons/search.png';
import mic from '../assets/social-icons/mic.png';
import bell from '../assets/social-icons/bell.png';
import rungBell from '../assets/social-icons/rung-bell.png';
import logo from '../assets/social-icons/logo.png';
import like from '../assets/social-icons/like.png';
import liked from '../assets/social-icons/liked.png';
import { BrowserProps } from './Browser';

const fontScale = (x: number) => Math.pow(x, 0.4);

export type ChannelDescription = {
    pfp: string;
    name: string;
    subscribers: number;
    subscribed: boolean;
    notifications: boolean;
};

export type VideoDescription = {
    subscriber_count: string;
    id: string;
    author: string;
    channel_id: string;
    title: string;
    duration: number;
    short_description: string;
    thumbnail: string;
    view_count: number;
    avatar: string;
};

export async function getYoutubeVideoDescription(
    url: string | VideoDescription,
): Promise<VideoDescription> {
    if (typeof url === 'object') {
        return url;
    }

    const response = await fetch(`./mcas?v=${url}`);
    return (await response.json())[0];
}

export async function getRandomVideos(n: number): Promise<VideoDescription[]> {
    const response = await fetch(`./mcas?random_videos=${n}`);
    return await response.json();
}

export interface WebsiteProps extends RectProps {
    site: 'youtube/watch';
    pfp?: string;
    searchString?: string;
    watching?: VideoDescription;
    likes?: string;
    liked?: boolean;
    disliked?: boolean;
    notifications?: boolean;
    videoRadius?: SignalValue<number>;
    constantScale?: SignalValue<number>;
}

export class Website extends Rect {
    declare public readonly site: WebsiteProps['site'];
    declare public readonly pfp: WebsiteProps['pfp'];
    declare public readonly searchString: WebsiteProps['pfp'];
    declare public readonly watching: WebsiteProps['watching'];
    declare public readonly likes: WebsiteProps['likes'];
    declare public readonly liked: WebsiteProps['liked'];
    declare public readonly disliked: WebsiteProps['disliked'];
    declare public readonly notifications: WebsiteProps['notifications'];

    @initial(20)
    @signal()
    declare public readonly videoRadius: SimpleSignal<number, this>;

    @initial(1)
    @signal()
    declare public readonly constantScale: SimpleSignal<number, this>;

    public constructor(props?: WebsiteProps) {
        super({
            ...props,
            layout: true,
            justifyContent: 'center',
            paddingTop: 25,
            paddingBottom: 25,
        });

        if (typeof this.videoRadius() == 'undefined') {
            this.videoRadius(20);
        }
        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }

        this.site = props?.site;
        this.pfp = props?.pfp;
        this.searchString = props?.searchString;
        this.watching = props?.watching;
        this.likes = props?.likes;
        this.liked = props?.liked;
        this.disliked = props?.disliked;
        this.notifications = props?.notifications;

        switch (this.site) {
            case 'youtube/watch': {
                this.fill('fill' in props ? props.fill : '#0F0F0F');
                this.add(
                    <Rect
                        layout
                        direction="column"
                        width="95%"
                        alignItems="center"
                    >
                        <YoutubeNavbar
                            constantScale={this.constantScale}
                            searchString={this.searchString}
                            pfp={this.pfp}
                        />
                        <Rect width="100%" marginTop={50}>
                            <Rect width="4.6%" />
                            <Rect direction="column" width="70.4%" gap={32}>
                                <Rect
                                    width="100%"
                                    radius={() =>
                                        this.constantScale() *
                                        this.videoRadius()
                                    }
                                    clip
                                >
                                    {(props.children as any)[0]}
                                </Rect>
                                <YoutubeVideoInfo
                                    constantScale={this.constantScale}
                                    watching={this.watching}
                                    likes={this.likes}
                                    liked={this.liked}
                                    disliked={this.disliked}
                                    notifications={this.notifications}
                                />
                                {2 in (props.children as any)
                                    ? (props.children as any)[2]
                                    : ''}
                            </Rect>
                            {(props.children as any)[1]}
                        </Rect>
                    </Rect>,
                );
            }
        }
    }
}

export interface YoutubeProps extends RectProps {
    constantScale?: SignalValue<number>;
    suggested?: { [key: string]: VideoDescription };
    watching?: VideoDescription;
    likes?: string;
    liked?: boolean;
    disliked?: boolean;
}

/* view.add(
 *   <Browser ref={browser} scroll={0}>
 *     <Website
 *       scale={1000 / 1920}
 *       width={1920}
 *       site="youtube/watch"
 *       watching={watching}
 *       likes="2.7K"
 *       liked
 *     >
 *       <Rect
 *         width="100%"
 *         ratio={16 / 9}
 *         fill={mkGradient("right", "red", "orange")}
 *       />
 *       <YoutubeSuggested videos={random} />
 *       <YoutubeCommentSection>
 *       </YoutubeCommentSection>
 *     </Website>
 *   </Browser>,
 * ); */

export class Youtube extends Rect {
    declare public readonly suggested: { [key: string]: VideoDescription };
    declare public readonly watching: VideoDescription;
    declare public readonly likes: string;
    declare public readonly liked: boolean;
    declare public readonly disliked: boolean;

    @initial(20)
    @signal()
    declare public readonly videoRadius: SimpleSignal<number, this>;

    @initial(1)
    @signal()
    declare public readonly constantScale: SimpleSignal<number, this>;

    constructor(props: YoutubeProps) {
        super({
            layout: true,
            ...props,
        });

        if (typeof this.videoRadius() == 'undefined') {
            this.videoRadius(20);
        }
        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.suggested = props?.suggested;
        this.watching = props?.watching;
        this.likes = props?.likes;
        this.liked = props?.liked;
        this.disliked = props?.disliked;

        this.add(
            <Website
                constantScale={this.constantScale}
                width={'100%'}
                site="youtube/watch"
                watching={this.watching}
                likes={this.likes}
                liked={this.liked}
                disliked={this.disliked}
                videoRadius={this.videoRadius}
            >
                {props.children}
                <YoutubeSuggested
                    constantScale={this.constantScale}
                    videos={this.suggested}
                />
                <YoutubeCommentSection constantScale={this.constantScale}>
                    <YoutubeComment constantScale={this.constantScale} />
                    <YoutubeComment constantScale={this.constantScale} />
                    <YoutubeComment constantScale={this.constantScale} />
                    <YoutubeComment constantScale={this.constantScale} />
                </YoutubeCommentSection>
            </Website>,
        );
    }
}

export interface SuggestedVideoProps extends RectProps {
    constantScale?: SignalValue<number>;
    thumbnail?: string;
    title?: string;
    channelName?: string;
    views?: string;
    age?: string;
}

export class SuggestedVideo extends Rect {
    declare public readonly thumbnail: string;
    declare public readonly title: string;
    declare public readonly channelName: string;
    declare public readonly views: string;
    declare public readonly age: string;

    @initial(1)
    @signal()
    declare public readonly constantScale: SimpleSignal<number, this>;

    constructor(props: SuggestedVideoProps) {
        super({
            ...props,
            width: '100%',
            alignItems: 'center',
            gap: () => this.constantScale() * 16,
            layout: true,
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.thumbnail = props?.thumbnail;
        this.title = props?.title;
        this.channelName = props?.channelName;
        this.views = props?.views;
        this.age = props?.age;

        this.add(
            <Img
                radius={() => this.constantScale() * 20}
                height={() => this.constantScale() * 120}
                src={this.thumbnail ?? 'https://picsum.photos/1600/900'}
            />,
        );

        this.add(
            <Rect direction="column" gap={4}>
                <Txt.b
                    width={() => this.constantScale() * 200}
                    textWrap
                    fill="white"
                    fontSize={() => fontScale(this.constantScale()) * 20}
                    text={this.title ?? 'Lorem ipsum dolor sit amet.'}
                />
                <Txt
                    fontSize={() => fontScale(this.constantScale()) * 18}
                    fill="909090"
                    text={this.channelName ?? 'Channel name'}
                />
                <Rect gap={() => this.constantScale() * 8} alignItems="center">
                    <Txt
                        fontSize={() => fontScale(this.constantScale()) * 16}
                        fill="909090"
                        text={
                            this.views
                                ? SIround(
                                      Number(this.views),
                                      unitsSocialMedia,
                                  ) + ' views'
                                : '100K views'
                        }
                    />
                    <Circle size={3} fill="909090" />
                    <Txt
                        fontSize={() => fontScale(this.constantScale()) * 16}
                        fill="909090"
                        text={this.age ?? '1 year ago'}
                    />
                </Rect>
            </Rect>,
        );
    }
}

export interface YoutubeSuggestedProps extends RectProps {
    constantScale?: SignalValue<number>;
    videos: { [key: string]: VideoDescription };
}

export class YoutubeSuggested extends Rect {
    declare public readonly videos: YoutubeSuggestedProps['videos'];

    @signal()
    @initial(1)
    declare public readonly constantScale: SimpleSignal<number, this>;

    constructor(props: YoutubeSuggestedProps) {
        super({
            ...props,
            width: '25%',
            direction: 'column',
            paddingLeft: () => this.constantScale() * 20,
            gap: () => this.constantScale() * 28,
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.videos = props?.videos;

        if (this.videos) {
            for (let video of Object.values(this.videos)) {
                this.add(
                    <SuggestedVideo
                        constantScale={this.constantScale}
                        thumbnail={video.thumbnail + '?url'}
                        title={video.title}
                        channelName={video.author}
                        views={`${video.view_count}`}
                    />,
                );
            }
        }
    }
}

export interface YoutubeCommentSectionProps extends RectProps {
    constantScale?: SignalValue<number>;
    pfp?: string;
    comment?: SignalValue<string>;
    nComments?: number;
}

export class YoutubeCommentSection extends Rect {
    declare public readonly pfp: YoutubeCommentSectionProps['pfp'];
    declare public readonly nComments: YoutubeCommentSectionProps['nComments'];

    @signal()
    @initial(1)
    declare public readonly constantScale: SimpleSignal<number, this>;

    @initial('Add a comment...')
    @signal()
    declare public readonly comment: SimpleSignal<string, this>;

    constructor(props: YoutubeCommentSectionProps) {
        super({
            ...props,
            direction: 'column',
            width: '100%',
            gap: () => this.constantScale() * 42,
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.pfp = props?.pfp;
        this.nComments = props?.nComments;

        this.add(
            <Rect
                width="100%"
                direction="column"
                gap={() => this.constantScale() * 32}
            >
                <Rect gap={() => this.constantScale() * 64} alignItems="center">
                    <Txt.b
                        fill="white"
                        fontSize={() => fontScale(this.constantScale()) * 35}
                        text={`${
                            this.nComments ?? this.children().length
                        } Comments`}
                    />
                    <Rect
                        alignItems="center"
                        gap={() => this.constantScale() * 18}
                    >
                        <Rect
                            direction="column"
                            gap={() => this.constantScale() * 12}
                        >
                            {a(3).map((_, i) => (
                                <Ray
                                    lineWidth={() => this.constantScale() * 3}
                                    stroke="white"
                                    fromX={() => this.constantScale() * -20}
                                    toX={() => this.constantScale() * 20}
                                    end={1 - i / 4}
                                />
                            ))}
                        </Rect>
                        <Txt
                            fill="white"
                            fontSize={() =>
                                fontScale(this.constantScale()) * 25
                            }
                        >
                            Sort by
                        </Txt>
                    </Rect>
                </Rect>
                <Rect
                    gap={() => this.constantScale() * 32}
                    width="100%"
                    alignItems="center"
                >
                    <Img
                        size={() => this.constantScale() * 70}
                        radius={999}
                        src={this.pfp ?? logo}
                    />
                    <Rect
                        direction="column"
                        width="100%"
                        gap={() => this.constantScale() * 6}
                    >
                        <Txt
                            fontSize={() =>
                                fontScale(this.constantScale()) * 30
                            }
                            fill={() =>
                                this.comment() == 'Add a comment...'
                                    ? '#909090'
                                    : 'white'
                            }
                            text={this.comment}
                        />
                        <Rect lineWidth={0.5} stroke="#909090" width="100%" />
                    </Rect>
                </Rect>
            </Rect>,
        );
        this.add(
            <Rect
                width="100%"
                direction="column"
                gap={() => this.constantScale() * 32}
            >
                {props.children}
            </Rect>,
        );
    }
}

export interface YoutubeCommentProps extends RectProps {
    constantScale?: SignalValue<number>;
    username?: string;
    datestring?: string;
    pfp?: string;
    text?: string;
}

export class YoutubeComment extends Rect {
    declare public readonly username: YoutubeCommentProps['username'];
    declare public readonly datestring: YoutubeCommentProps['datestring'];
    declare public readonly pfp: YoutubeCommentProps['pfp'];
    declare public readonly text: YoutubeCommentProps['text'];

    @signal()
    @initial(1)
    declare public readonly constantScale: SimpleSignal<number, this>;

    constructor(props: YoutubeCommentProps) {
        super({
            ...props,
            gap: () => this.constantScale() * 32,
            width: '100%',
            alignItems: 'center',
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.username =
            props.username ??
            `@user${a(8)
                .map(_ => (Math.random() * 10).toFixed(0))
                .join('')}`;
        this.datestring = props.datestring ?? '1 year ago';
        this.pfp = props.pfp ?? logo;
        this.text =
            props.text ??
            'Quos quis fuga ratione consequatur eius qui. Nostrum officia quasi id odit fugit voluptatem eligendi sed. Quia delectus rerum sint repudiandae laboriosam aliquid optio sit. Aut cupiditate et ad quia debitis. Minima atque itaque quaerat eveniet. Veritatis rerum id suscipit officiis labore.';

        this.add(
            <Img
                size={() => this.constantScale() * 70}
                radius={999}
                src={this.pfp}
            />,
        );
        this.add(
            <Rect
                direction="column"
                width="100%"
                gap={() => this.constantScale() * 6}
            >
                <Rect gap={() => this.constantScale() * 12}>
                    <Txt.b
                        fontSize={() => fontScale(this.constantScale()) * 20}
                        fill="white"
                        text={this.username}
                    />
                    <Txt
                        fontSize={() => fontScale(this.constantScale()) * 20}
                        fill="909090"
                        text={this.datestring}
                    />
                </Rect>
                <Txt
                    textWrap
                    fontSize={() => fontScale(this.constantScale()) * 20}
                    fill="white"
                    text={this.text}
                />
            </Rect>,
        );
    }
}

export interface YoutubeVideoInfoProps extends RectProps {
    constantScale?: SignalValue<number>;
    watching?: VideoDescription;
    likes?: string;
    liked?: boolean;
    disliked?: boolean;
    notifications?: boolean;
}

export class YoutubeVideoInfo extends Rect {
    declare public readonly watching: YoutubeVideoInfoProps['watching'];
    declare public readonly likes: YoutubeVideoInfoProps['likes'];
    declare public readonly liked: YoutubeVideoInfoProps['liked'];
    declare public readonly disliked: YoutubeVideoInfoProps['disliked'];
    declare public readonly notifications: YoutubeVideoInfoProps['notifications'];

    @signal()
    @initial(1)
    declare public readonly constantScale: SimpleSignal<number, this>;

    @initial('foobar')
    @signal()
    declare public readonly title: SimpleSignal<string, this>;

    public constructor(props: YoutubeVideoInfoProps) {
        super({
            ...props,
            direction: 'column',
            gap: 16,
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.watching = props?.watching;
        this.likes = props?.likes;
        this.liked = props?.liked;
        this.disliked = props?.disliked;
        this.notifications = props?.notifications;
        this.add(
            <Rect width="100%">
                <Txt.b
                    fill="white"
                    fontSize={() => fontScale(this.constantScale()) * 35}
                    text={this.watching.title}
                />
            </Rect>,
        );
        this.add(
            <Rect
                width="100%"
                height={() => this.constantScale() * 70}
                justifyContent="space-between"
                alignItems="center"
            >
                <Rect
                    height="100%"
                    alignItems="center"
                    gap={() => this.constantScale() * 42}
                >
                    <Rect
                        height="100%"
                        alignItems="center"
                        gap={() => this.constantScale() * 20}
                    >
                        <Img
                            src={this.watching.avatar ?? logo}
                            height="100%"
                            radius={999}
                        />
                        <Rect direction="column">
                            <Txt
                                fill="white"
                                fontSize={() =>
                                    fontScale(this.constantScale()) * 30
                                }
                                text={this.watching.author}
                            />
                            <Txt
                                fill="#757575"
                                fontSize={() =>
                                    fontScale(this.constantScale()) * 20
                                }
                                text={this.watching.subscriber_count}
                            />
                        </Rect>
                    </Rect>
                    <Rect
                        height="70%"
                        radius={999}
                        fill="#222222"
                        alignItems="center"
                        paddingLeft={() => fontScale(this.constantScale()) * 20}
                        paddingRight={() =>
                            fontScale(this.constantScale()) * 25
                        }
                        gap={() => fontScale(this.constantScale()) * 8}
                    >
                        <Img
                            height="40%"
                            src={this.notifications ? rungBell : bell}
                        />
                        <Txt
                            fill="white"
                            fontSize={() =>
                                fontScale(this.constantScale()) * 25
                            }
                        >
                            Subscribed
                        </Txt>
                    </Rect>
                </Rect>
                <Rect
                    paddingLeft={() => this.constantScale() * 30}
                    paddingRight={() => this.constantScale() * 30}
                    height="70%"
                    alignItems="center"
                    radius={999}
                    fill="#222222"
                    gap={() => this.constantScale() * 32}
                >
                    <Rect
                        gap={() => this.constantScale() * 16}
                        height="100%"
                        alignItems="center"
                    >
                        <Img src={this.liked ? liked : like} height="40%" />
                        <Txt
                            fill="white"
                            fontSize={() =>
                                fontScale(this.constantScale()) * 30
                            }
                            text={
                                this.likes ??
                                (this.watching.view_count / 10).toFixed(0)
                            }
                        />
                    </Rect>
                    <Rect
                        width={0}
                        height="60%"
                        lineWidth={() => this.constantScale() * 0.5}
                        stroke="white"
                    />
                    <Img
                        src={this.disliked ? liked : like}
                        height="40%"
                        rotation={180}
                    />
                </Rect>
            </Rect>,
        );
        this.add(
            <Rect
                marginTop={() => this.constantScale() * 18}
                width="100%"
                radius={() => this.constantScale() * 20}
                fill="#222222"
                direction="column"
                padding={() => this.constantScale() * 20}
                gap={() => this.constantScale() * 12}
            >
                <Rect gap={() => this.constantScale() * 16}>
                    <Txt
                        fontSize={() => fontScale(this.constantScale()) * 25}
                        fill="white"
                        text={
                            SIround(
                                this.watching.view_count,
                                unitsSocialMedia,
                            ) + ' views'
                        }
                    />
                    <Txt
                        fontSize={() => fontScale(this.constantScale()) * 25}
                        fill="white"
                    >
                        2 years ago
                    </Txt>
                </Rect>
                <Rect direction="column" gap={() => this.constantScale() * 12}>
                    {this.watching.short_description.split('\n').map(x => (
                        <Txt
                            fill="white"
                            fontSize={() =>
                                fontScale(this.constantScale()) * 25
                            }
                            textWrap
                            text={x}
                        />
                    ))}
                </Rect>
            </Rect>,
        );
    }
}

export interface YoutubeNavbarProps extends RectProps {
    constantScale?: SignalValue<number>;
    searchString?: string;
    pfp?: string;
}

export class YoutubeNavbar extends Rect {
    declare public readonly pfp: YoutubeNavbarProps['pfp'];
    declare public readonly searchString: YoutubeNavbarProps['pfp'];

    @signal()
    @initial(1)
    declare public readonly constantScale: SimpleSignal<number, this>;

    constructor(props: YoutubeNavbarProps) {
        super({
            ...props,
            layout: true,
            height: 50,
            width: '100%',
            justifyContent: 'space-between',
        });

        if (typeof this.constantScale() == 'undefined') {
            this.constantScale(1);
        }
        this.searchString = props?.searchString;
        this.pfp = props.pfp ?? logo;

        this.add(
            <Rect gap={() => this.constantScale() * 42}>
                <Rect
                    direction="column"
                    height="100%"
                    justifyContent="space-evenly"
                >
                    {a(3).map(_ => (
                        <Ray
                            lineWidth={() => this.constantScale() * 3}
                            stroke="white"
                            fromX={() => this.constantScale() * -20}
                            toX={() => this.constantScale() * 20}
                        />
                    ))}
                </Rect>
                <Img src={youtubeLogo} height="100%" />
            </Rect>,
        );
        this.add(
            <Rect gap={() => this.constantScale() * 32} height="100%">
                <Rect
                    radius={999}
                    height="100%"
                    stroke="#303030"
                    lineWidth={1}
                    justifyContent="space-between"
                    alignItems="center"
                    paddingLeft={() => 40}
                    width={() => this.constantScale() * 600}
                    clip
                >
                    <Txt
                        fill={this.searchString ? 'white' : '#757575'}
                        fontSize={() => fontScale(this.constantScale()) * 30}
                    >
                        {this.searchString ? this.searchString : 'Search'}
                    </Txt>
                    <Rect
                        fill="#222222"
                        width={() => this.constantScale() * 80}
                        height="100%"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Img src={search} height="70%" />
                    </Rect>
                </Rect>
                <Circle
                    stroke="#303030"
                    lineWidth={1}
                    height="100%"
                    ratio={1}
                    fill="#222222"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Img src={mic} height="70%" />
                </Circle>
            </Rect>,
        );
        this.add(
            <Rect
                height="100%"
                gap={32}
                justifyContent="end"
                width={200}
                alignItems="center"
            >
                <Img src={bell} height="70%" />
                <Img src={this.pfp} height="100%" radius={999} />
            </Rect>,
        );
    }
}
