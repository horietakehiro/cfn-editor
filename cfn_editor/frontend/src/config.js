export const BASE_API_URL = "http://localhost:8000/api/"
export const BASE_STATIC_URL = "http://localhost:8000/static/"
export const BUILT_IN_VARIABLES = [
    "AWS::AccountId",
    "AWS::NotificationARNs",
    "AWS::NoValue",
    "AWS::Partition",
    "AWS::Region",
    "AWS::StackId",
    "AWS::StackName",
    "AWS::URLSuffix",
]
export const EMPTY_TEMPLATE_STR = JSON.stringify({
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "",
    "Metadata": {

    },
    "Parameters": {

    },
    "Mappings": {

    },
    "Conditions": {

    },
    "Resources": {

    },
    "Outputs": {

    }
})
