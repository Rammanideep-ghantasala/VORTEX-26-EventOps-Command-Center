package com.vortex.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class VortexServerApplication

fun main(args: Array<String>) {
    runApplication<VortexServerApplication>(*args)
}

