
# Table of Contents

1.  [`popin` / `popout`](#org6d9aeee)
2.  [`popinSize` / `popoutSize`](#orga013dad)



<a id="org6d9aeee"></a>

# `popin` / `popout`

`popin` is a spring from a `scale` of `0` up to `1`. Use it like:

    const ref = createRef<Rect>();
    view.add(<Rect width={500} height={500} />)
    
    // make sure the scale is 0 initially, if there are other animations before it
    ref().scale(0);
    
    yield* popin(ref);

If you are using `createRefArray` then you will need to wrap the ref in a function:

    yield* popin(() => ref[0]);

`popout` is the opposite of `popin`.


<a id="orga013dad"></a>

# `popinSize` / `popoutSize`

The same as [`popin` / `popout`](#org6d9aeee) but using the `size` instead of the `scale`.

