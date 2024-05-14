
# Table of Contents

1.  [Usage](#orge806ede)
2.  [Properties](#orgf12c28e)
    1.  [`duration`](#orge6b1ebc)
    2.  [`offsetsList`](#orga6500f1)
    3.  [`currentOffset`](#org37d8f54)



<a id="orge806ede"></a>

# Usage

`<SquigglyBorder/>` applies a wiggling border around its child component. You will probably want to animate this, like so:

    const squiggle = createRef<SquigglyBorder>();
    
    view.add(<SquigglyBorder ref={squiggle}>
        // content here
      </SquigglyBorder>);
    
    for ( let i=0; i < 100; ++i ){
      yield* squiggle().wiggle();
    };

where the `.wiggle()` method proceeds to the next offset in `.offsetsList`. You can optionally provide it a duration for the wiggle to take.


<a id="orgf12c28e"></a>

# Properties


<a id="orge6b1ebc"></a>

## `duration`

The duration for `.wiggle()` to use, this is overridden if a duration is provided directly to `.wiggle()`. It defaults to `0.2`.


<a id="orga6500f1"></a>

## `offsetsList`

This is a `TCorners[]`. See the types documentation for more information. It is pre-loaded with a reasonable default. What this does is gives a number of 2-component vector offsets for each corner at each different step.


<a id="org37d8f54"></a>

## `currentOffset`

The offset that is currently active. Maybe you want to drive some other animation with this information, or start from a specific offset. I don&rsquo;t know why else you would want to use this.

