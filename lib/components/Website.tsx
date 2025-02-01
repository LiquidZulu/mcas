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
import { a, SIround, unitsSocialMedia } from '../util';
import youtubeLogo from '../assets/social-icons/youtube-logo.png';
import search from '../assets/social-icons/search.png';
import mic from '../assets/social-icons/mic.png';
import bell from '../assets/social-icons/bell.png';
import rungBell from '../assets/social-icons/rung-bell.png';
import logo from '../assets/social-icons/logo.png';
import like from '../assets/social-icons/like.png';
import liked from '../assets/social-icons/liked.png';
import { BrowserProps } from './Browser';

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
}

export class Website extends Rect {
    public declare readonly site: WebsiteProps['site'];
    public declare readonly pfp: WebsiteProps['pfp'];
    public declare readonly searchString: WebsiteProps['pfp'];
    public declare readonly watching: WebsiteProps['watching'];
    public declare readonly likes: WebsiteProps['likes'];
    public declare readonly liked: WebsiteProps['liked'];
    public declare readonly disliked: WebsiteProps['disliked'];
    public declare readonly notifications: WebsiteProps['notifications'];

    public constructor(props?: WebsiteProps) {
        super({
            ...props,
            layout: true,
            justifyContent: 'center',
            paddingTop: 25,
            paddingBottom: 25,
        });

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
                            searchString={this.searchString}
                            pfp={this.pfp}
                        />
                        <Rect width="100%" marginTop={50}>
                            <Rect width="4.6%" />
                            <Rect direction="column" width="70.4%" gap={32}>
                                <Rect width="100%" radius={20} clip>
                                    {(props.children as any)[0]}
                                </Rect>
                                <YoutubeVideoInfo
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
    public declare readonly suggested: { [key: string]: VideoDescription };
    public declare readonly watching: VideoDescription;
    public declare readonly likes: string;
    public declare readonly liked: boolean;
    public declare readonly disliked: boolean;

    constructor(props: YoutubeProps) {
        super({
            layout: true,
            ...props,
        });

        this.suggested = props?.suggested;
        this.watching = props?.watching;
        this.likes = props?.likes;
        this.liked = props?.liked;
        this.disliked = props?.disliked;

        this.add(
            <Website
                width={1920}
                site="youtube/watch"
                watching={this.watching}
                likes={this.likes}
                liked={this.liked}
                disliked={this.disliked}
            >
                {props.children}
                <YoutubeSuggested videos={this.suggested} />
                <YoutubeCommentSection>
                    <YoutubeComment />
                    <YoutubeComment />
                    <YoutubeComment />
                    <YoutubeComment />
                </YoutubeCommentSection>
            </Website>,
        );
    }
}

export interface SuggestedVideoProps extends RectProps {
    thumbnail?: string;
    title?: string;
    channelName?: string;
    views?: string;
    age?: string;
}

export class SuggestedVideo extends Rect {
    public declare readonly thumbnail: string;
    public declare readonly title: string;
    public declare readonly channelName: string;
    public declare readonly views: string;
    public declare readonly age: string;

    constructor(props: SuggestedVideoProps) {
        super({
            ...props,
            width: '100%',
            alignItems: 'center',
            gap: 16,
        });

        this.thumbnail = props?.thumbnail;
        this.title = props?.title;
        this.channelName = props?.channelName;
        this.views = props?.views;
        this.age = props?.age;

        this.add(
            <Img
                radius={20}
                height={120}
                src={this.thumbnail ?? 'https://picsum.photos/1600/900'}
            />,
        );

        this.add(
            <Rect direction="column" gap={4}>
                <Txt.b
                    width={200}
                    textWrap
                    fill="white"
                    fontSize={18}
                    text={this.title ?? 'Lorem ipsum dolor sit amet.'}
                />
                <Txt
                    fontSize={16}
                    fill="909090"
                    text={this.channelName ?? 'Channel name'}
                />
                <Rect gap={8} alignItems="center">
                    <Txt
                        fontSize={16}
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
                        fontSize={16}
                        fill="909090"
                        text={this.age ?? '1 year ago'}
                    />
                </Rect>
            </Rect>,
        );
    }
}

export interface YoutubeSuggestedProps extends RectProps {
    videos: { [key: string]: VideoDescription };
}

export class YoutubeSuggested extends Rect {
    public declare readonly videos: YoutubeSuggestedProps['videos'];

    constructor(props: YoutubeSuggestedProps) {
        super({
            ...props,
            width: '25%',
            direction: 'column',
            paddingLeft: 20,
            gap: 28,
        });

        this.videos = props?.videos;

        if (this.videos) {
            for (let video of Object.values(this.videos)) {
                this.add(
                    <SuggestedVideo
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
    pfp?: string;
    comment?: SignalValue<string>;
    nComments?: number;
}

export class YoutubeCommentSection extends Rect {
    public declare readonly pfp: YoutubeCommentSectionProps['pfp'];
    public declare readonly nComments: YoutubeCommentSectionProps['nComments'];

    @initial('Add a comment...')
    @signal()
    public declare readonly comment: SimpleSignal<string, this>;

    constructor(props: YoutubeCommentSectionProps) {
        super({
            ...props,
            direction: 'column',
            width: '100%',
            gap: 42,
        });

        this.pfp = props?.pfp;
        this.nComments = props?.nComments;

        this.add(
            <Rect width="100%" direction="column" gap={32}>
                <Rect gap={64} alignItems="center">
                    <Txt.b
                        fill="white"
                        fontSize={35}
                        text={`${
                            this.nComments ?? this.children().length
                        } Comments`}
                    />
                    <Rect alignItems="center" gap={18}>
                        <Rect direction="column" gap={12}>
                            {a(3).map((_, i) => (
                                <Ray
                                    lineWidth={3}
                                    stroke="white"
                                    fromX={-20}
                                    toX={20}
                                    end={1 - i / 4}
                                />
                            ))}
                        </Rect>
                        <Txt fill="white" fontSize={25}>
                            Sort by
                        </Txt>
                    </Rect>
                </Rect>
                <Rect gap={32} width="100%" alignItems="center">
                    <Img size={70} radius={999} src={this.pfp ?? logo} />
                    <Rect direction="column" width="100%" gap={6}>
                        <Txt
                            fontSize={30}
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
            <Rect width="100%" direction="column" gap={32}>
                {props.children}
            </Rect>,
        );
    }
}

export interface YoutubeCommentProps extends RectProps {
    username?: string;
    datestring?: string;
    pfp?: string;
    text?: string;
}

export class YoutubeComment extends Rect {
    public declare readonly username: YoutubeCommentProps['username'];
    public declare readonly datestring: YoutubeCommentProps['datestring'];
    public declare readonly pfp: YoutubeCommentProps['pfp'];
    public declare readonly text: YoutubeCommentProps['text'];

    constructor(props: YoutubeCommentProps) {
        super({ ...props, gap: 32, width: '100%', alignItems: 'center' });

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

        this.add(<Img size={70} radius={999} src={this.pfp} />);
        this.add(
            <Rect direction="column" width="100%" gap={6}>
                <Rect gap={12}>
                    <Txt.b fontSize={20} fill="white" text={this.username} />
                    <Txt fontSize={20} fill="909090" text={this.datestring} />
                </Rect>
                <Txt textWrap fontSize={20} fill="white" text={this.text} />
            </Rect>,
        );
    }
}

export interface YoutubeVideoInfoProps extends RectProps {
    watching?: VideoDescription;
    likes?: string;
    liked?: boolean;
    disliked?: boolean;
    notifications?: boolean;
}

export class YoutubeVideoInfo extends Rect {
    public declare readonly watching: YoutubeVideoInfoProps['watching'];
    public declare readonly likes: YoutubeVideoInfoProps['likes'];
    public declare readonly liked: YoutubeVideoInfoProps['liked'];
    public declare readonly disliked: YoutubeVideoInfoProps['disliked'];
    public declare readonly notifications: YoutubeVideoInfoProps['notifications'];

    @initial('foobar')
    @signal()
    public declare readonly title: SimpleSignal<string, this>;

    public constructor(props: YoutubeVideoInfoProps) {
        super({
            ...props,
            direction: 'column',
            gap: 16,
        });

        this.watching = props?.watching;
        this.likes = props?.likes;
        this.liked = props?.liked;
        this.disliked = props?.disliked;
        this.notifications = props?.notifications;
        this.add(
            <Rect width="100%">
                <Txt.b fill="white" fontSize={35} text={this.watching.title} />
            </Rect>,
        );
        this.add(
            <Rect width="100%" height={70} justifyContent="space-between">
                <Rect height="100%" alignItems="center" gap={42}>
                    <Rect height="100%" alignItems="center" gap={20}>
                        <Img
                            src={this.watching.avatar ?? logo}
                            height="100%"
                            radius={999}
                        />
                        <Rect direction="column">
                            <Txt
                                fill="white"
                                fontSize={30}
                                text={this.watching.author}
                            />
                            <Txt
                                fill="#757575"
                                fontSize={20}
                                text={this.watching.subscriber_count}
                            />
                        </Rect>
                    </Rect>
                    <Rect
                        height="100%"
                        radius={999}
                        fill="#222222"
                        alignItems="center"
                        paddingLeft={20}
                        paddingRight={25}
                        gap={8}
                    >
                        <Img
                            height="70%"
                            src={this.notifications ? rungBell : bell}
                        />
                        <Txt fill="white" fontSize={25}>
                            Subscribed
                        </Txt>
                    </Rect>
                </Rect>
                <Rect
                    paddingLeft={30}
                    paddingRight={30}
                    height="100%"
                    alignItems="center"
                    radius={999}
                    fill="#222222"
                    gap={32}
                >
                    <Rect gap={16} height="100%" alignItems="center">
                        <Img src={this.liked ? liked : like} height="50%" />
                        <Txt
                            fill="white"
                            fontSize={30}
                            text={
                                this.likes ??
                                (this.watching.view_count / 10).toFixed(0)
                            }
                        />
                    </Rect>
                    <Rect
                        width={0}
                        height="70%"
                        lineWidth={0.5}
                        stroke="white"
                    />
                    <Img
                        src={this.disliked ? liked : like}
                        height="50%"
                        rotation={180}
                    />
                </Rect>
            </Rect>,
        );
        this.add(
            <Rect
                marginTop={18}
                width="100%"
                radius={20}
                fill="#222222"
                direction="column"
                padding={20}
                gap={12}
            >
                <Rect gap={16}>
                    <Txt
                        fontSize={25}
                        fill="white"
                        text={
                            SIround(
                                this.watching.view_count,
                                unitsSocialMedia,
                            ) + ' views'
                        }
                    />
                    <Txt fontSize={25} fill="white">
                        2 years ago
                    </Txt>
                </Rect>
                <Rect direction="column" gap={12}>
                    {this.watching.short_description.split('\n').map(x => (
                        <Txt fill="white" fontSize={25} textWrap text={x} />
                    ))}
                </Rect>
            </Rect>,
        );
    }
}

export interface YoutubeNavbarProps extends RectProps {
    searchString?: string;
    pfp?: string;
}

export class YoutubeNavbar extends Rect {
    public declare readonly pfp: YoutubeNavbarProps['pfp'];
    public declare readonly searchString: YoutubeNavbarProps['pfp'];

    constructor(props: YoutubeNavbarProps) {
        super({
            ...props,
            layout: true,
            height: 50,
            width: '100%',
            justifyContent: 'space-between',
        });

        this.searchString = props?.searchString;
        this.pfp = props.pfp ?? logo;

        this.add(
            <Rect gap={42}>
                <Rect
                    direction="column"
                    height="100%"
                    justifyContent="space-evenly"
                >
                    {a(3).map(_ => (
                        <Ray
                            lineWidth={3}
                            stroke="white"
                            fromX={-20}
                            toX={20}
                        />
                    ))}
                </Rect>
                <Img src={youtubeLogo} height="100%" />
            </Rect>,
        );
        this.add(
            <Rect gap={32} height="100%">
                <Rect
                    radius={999}
                    height="100%"
                    stroke="#303030"
                    lineWidth={1}
                    justifyContent="space-between"
                    alignItems="center"
                    paddingLeft={40}
                    width={600}
                    clip
                >
                    <Txt
                        fill={this.searchString ? 'white' : '#757575'}
                        fontSize={30}
                    >
                        {this.searchString ? this.searchString : 'Search'}
                    </Txt>
                    <Rect
                        fill="#222222"
                        width={80}
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
