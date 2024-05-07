
# Table of Contents

1.  [Usage](#org27e0db5)
2.  [Additional Properties](#org4d12d4d)
    1.  [glow](#org02366da)



<a id="org27e0db5"></a>

# Usage

`McasTxt` is an extension to motion canvas&rsquo; `Txt` with additional properties, you can either use it directly or alias it like so:

    import { McasTxt as Txt } from 'mcas';
    
    ...
    
    view.add(<Txt glow fontFamily="Oswald">GLOWING TEXT</Txt>)


<a id="org4d12d4d"></a>

# Additional Properties


<a id="org02366da"></a>

## glow

Doing `<McasTxt glow />` is equivalent to `<Txt shadowBlur={n} shadowColor={c}/>` where `n` is the `fontSize` and `c` is the `fill`.

