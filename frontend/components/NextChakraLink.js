import {
    Link as ChakraLink,
    LinkProps as ChakraLinkProps,
} from "@chakra-ui/react"
import NextLink, { LinkProps as NextLinkProps } from "next/link"
import { PropsWithChildren } from "react"


//  Has to be a new component because both chakra and next share the `as` keyword
export default function ({
    href,
    as,
    replace,
    scroll,
    shallow,
    prefetch,
    children,
    ...chakraProps }
) {
    return (<NextLink
        passHref={true}
        href={href}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        prefetch={prefetch}
    >
        <ChakraLink as="span" {...chakraProps}>
            {children}
        </ChakraLink>
    </NextLink>
    )
}