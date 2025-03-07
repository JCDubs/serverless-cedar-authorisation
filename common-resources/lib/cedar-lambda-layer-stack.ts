import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface CedarLambdaLayerStackProps extends cdk.StackProps {
  organisationId: string;
}

export class CedarLambdaLayerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CedarLambdaLayerStackProps) {
    super(scope, id, props);

    const cedarLayer = new lambda.LayerVersion(this, 'CedarLayer', {
      code: lambda.Code.fromAsset(path.join(process.cwd(), 'dist/cedar-layer')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'A layer containing the Cedar WASM package',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new lambda.CfnLayerVersionPermission(this, `GrantOrgPermission${props.organisationId}`, {
      action: 'lambda:GetLayerVersion',
      layerVersionArn: cedarLayer.layerVersionArn,
      principal: '*',
      organizationId: props.organisationId,
    });
  }
}
